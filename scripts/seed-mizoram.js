'use strict';

/**
 * Seed script for Mizoram data into TripSwipe Strapi backend.
 * Reads the curated CSV, creates state/cities/tags/places.
 *
 * Usage: node scripts/seed-mizoram.js
 */

const fs = require('fs');
const path = require('path');

const MIZORAM_COVER_IMAGE = 'https://images.unsplash.com/photo-1649321588233-b8d19c473664?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080';

// Simple CSV parser that handles quoted fields
function parseCSV(text) {
  const rows = [];
  let current = '';
  let inQuotes = false;
  const lines = text.split('\n');

  for (const line of lines) {
    if (inQuotes) {
      current += '\n' + line;
      if ((line.match(/"/g) || []).length % 2 === 1) {
        inQuotes = false;
        rows.push(current);
        current = '';
      }
    } else {
      if ((line.match(/"/g) || []).length % 2 === 1) {
        inQuotes = true;
        current = line;
      } else {
        rows.push(line);
      }
    }
  }
  if (current) rows.push(current);

  return rows.filter(r => r.trim()).map(row => {
    const fields = [];
    let field = '';
    let inQ = false;
    for (let i = 0; i < row.length; i++) {
      const ch = row[i];
      if (ch === '"') {
        if (inQ && row[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQ = !inQ;
        }
      } else if (ch === ',' && !inQ) {
        fields.push(field.trim());
        field = '';
      } else {
        field += ch;
      }
    }
    fields.push(field.trim());
    return fields;
  });
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// Map CSV type to Strapi category enum
function mapCategory(type) {
  const t = (type || '').toLowerCase();
  if (['restaurant', 'cafe', 'activity', 'adventure', 'wellness', 'shopping'].includes(t)) return 'activity';
  if (['resort', 'hotel', 'homestay', 'accommodation'].includes(t)) return 'stay';
  return 'attraction';
}

// Map popularity score (1-5) to Strapi popularity_score (0-100)
function mapPopularity(score) {
  const s = parseInt(score) || 1;
  return s * 20; // 1->20, 2->40, 3->60, 4->80, 5->100
}

async function seed() {
  console.log('=== TripSwipe Mizoram Seed ===\n');

  // Read CSV
  const csvPath = path.join(__dirname, '..', 'Desktop', 'mizoram_crawled_data - mizoram_crawled_data.csv.csv');
  const altPath = '/Users/adityashankar/Desktop/mizoram_crawled_data - mizoram_crawled_data.csv.csv';
  const filePath = fs.existsSync(csvPath) ? csvPath : altPath;

  if (!fs.existsSync(filePath)) {
    console.error('CSV file not found at:', filePath);
    process.exit(1);
  }

  const csvText = fs.readFileSync(filePath, 'utf8');
  const allRows = parseCSV(csvText);
  const headers = allRows[0];
  const dataRows = allRows.slice(1);

  console.log(`Loaded ${dataRows.length} places from CSV`);
  console.log(`Columns: ${headers.join(', ')}\n`);

  // Boot Strapi
  console.log('[1/7] Loading Strapi...');
  const { compileStrapi, createStrapi } = require('@strapi/core');
  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();
  const db = app.db;
  console.log('  Strapi loaded.\n');

  // Helper: find or create
  async function findOrCreate(uid, filters, data) {
    const existing = await db.query(uid).findOne({ where: filters });
    if (existing) return { entry: existing, created: false };
    const entry = await db.query(uid).create({ data });
    return { entry, created: true };
  }

  async function publishEntry(uid, id) {
    try {
      await db.query(uid).update({ where: { id }, data: { publishedAt: new Date().toISOString() } });
    } catch { /* already published */ }
  }

  // 2. Find or create India
  console.log('[2/7] Country...');
  const { entry: india } = await findOrCreate('api::country.country', { name: 'India' }, {
    name: 'India', slug: 'india', code: 'IN',
  });
  await publishEntry('api::country.country', india.id);
  console.log(`  India (id=${india.id})\n`);

  // 3. Create Mizoram state
  console.log('[3/7] State...');
  const { entry: mizoram, created: mzCreated } = await findOrCreate('api::state.state', { name: 'Mizoram' }, {
    name: 'Mizoram', slug: 'mizoram', country: india.id,
  });
  console.log(`  Mizoram ${mzCreated ? 'CREATED' : 'exists'} (id=${mizoram.id})\n`);

  // 4. Create cities (districts)
  console.log('[4/7] Cities/Districts...');
  const districts = [...new Set(dataRows.map(r => r[2]))]; // Column C = City/District
  const cityMap = {};

  for (const dist of districts) {
    if (!dist) continue;
    const { entry, created } = await findOrCreate('api::city.city', { name: dist }, {
      name: dist,
      slug: slugify(dist),
      state: mizoram.id,
      country: india.id,
    });
    await publishEntry('api::city.city', entry.id);
    cityMap[dist] = entry;
    console.log(`  ${dist} ${created ? 'CREATED' : 'exists'}`);
  }

  // Set Mizoram cover image on the first city or create a "Mizoram" entry
  // Actually, let's store it as extra_attributes on cities for the frontend to pick up
  console.log();

  // 5. Create tags
  console.log('[5/7] Tags...');
  const allTags = new Set();
  for (const row of dataRows) {
    const tags = (row[5] || '').split(',').map(t => t.trim()).filter(Boolean);
    const score = parseInt(row[7]) || 1;
    tags.forEach(t => allTags.add(t));
    if (score === 5) allTags.add('Popular among tourists');
  }

  const TAG_TYPE_MAP = {
    'Nature': 'terrain', 'Photography': 'activity_type', 'Adventure': 'activity_type',
    'Hiking': 'activity_type', 'Heritage': 'theme', 'Religion': 'theme',
    'Sightseeing': 'activity_type', 'Holiday': 'vibe', 'Travel': 'vibe',
    'Wildlife': 'terrain', 'Vacation': 'vibe', 'Lake': 'terrain',
    'Waterfall': 'terrain', 'Bird watching': 'activity_type', 'Park': 'terrain',
    'History': 'theme', 'Architecture': 'theme', 'Mystery': 'vibe',
    'Culture': 'theme', 'Scenic': 'vibe', 'Relaxation': 'vibe',
    'Camping': 'activity_type', 'Trekking': 'activity_type', 'Shopping': 'activity_type',
    'Popular among tourists': 'theme',
  };

  const tagMap = {};
  for (const tagName of allTags) {
    const tagType = TAG_TYPE_MAP[tagName] || 'theme';
    const { entry, created } = await findOrCreate('api::tag.tag', { name: tagName }, {
      name: tagName, slug: slugify(tagName), type: tagType,
    });
    tagMap[tagName] = entry;
    if (created) console.log(`  + ${tagName} (${tagType})`);
  }
  console.log(`  ${allTags.size} tags processed.\n`);

  // 6. Create places
  console.log('[6/7] Places...');
  let createdCount = 0;
  let skippedCount = 0;

  for (const row of dataRows) {
    const [country, state, district, name, type, tagsStr, description, popularityStr, img1, img2, img3, img4] = row;

    if (!name) { skippedCount++; continue; }

    // Idempotency
    const existing = await db.query('api::place.place').findOne({ where: { name } });
    if (existing) { skippedCount++; continue; }

    const cityEntry = cityMap[district];
    if (!cityEntry) { console.log(`  WARN: No city for "${district}", skipping "${name}"`); skippedCount++; continue; }

    const popularity = parseInt(popularityStr) || 1;
    const tags = (tagsStr || '').split(',').map(t => t.trim()).filter(Boolean);
    if (popularity === 5 && !tags.includes('Popular among tourists')) {
      tags.push('Popular among tourists');
    }

    const tagIds = tags.map(t => tagMap[t]?.id).filter(Boolean);
    const images = [img1, img2, img3, img4].filter(Boolean);

    const placeData = {
      name,
      slug: slugify(name),
      category: mapCategory(type),
      subcategory: type || 'Place of visit',
      city: cityEntry.id,
      country: india.id,
      short_description: (description || '').substring(0, 200),
      description: description || '',
      rating: popularity === 5 ? 4.8 : popularity === 4 ? 4.5 : popularity === 3 ? 4.2 : popularity === 2 ? 4.0 : 3.8,
      area: district,
      duration_label: '2-3 hours',
      cost_level: 'budget',
      best_months: ['October', 'November', 'December', 'January', 'February', 'March'],
      popularity_score: mapPopularity(popularity),
      is_featured: popularity >= 4,
      tags: tagIds,
      extra_attributes: {
        image_urls: images,
        source: 'mizoramtourism.com',
      },
    };

    try {
      const entry = await db.query('api::place.place').create({ data: placeData });
      await publishEntry('api::place.place', entry.id);
      createdCount++;
      console.log(`  + ${name} (${mapCategory(type)}) [score=${popularity}]`);
    } catch (err) {
      console.error(`  ERROR "${name}":`, err.message);
    }
  }

  console.log(`\n  Places: ${createdCount} created, ${skippedCount} skipped.\n`);

  // 7. Set permissions (same as main seed)
  console.log('[7/7] Checking permissions...');
  const publicRole = await db.query('plugin::users-permissions.role').findOne({ where: { type: 'public' } });
  if (publicRole) {
    const publicReadable = ['api::country.country', 'api::state.state', 'api::city.city', 'api::place.place', 'api::tag.tag'];
    for (const uid of publicReadable) {
      for (const action of ['find', 'findOne']) {
        const permAction = uid + '.' + action;
        const existing = await db.query('plugin::users-permissions.permission').findOne({
          where: { action: permAction, role: publicRole.id },
        });
        if (!existing) {
          await db.query('plugin::users-permissions.permission').create({
            data: { action: permAction, role: publicRole.id },
          });
        }
      }
    }
    console.log('  Permissions OK.');
  }

  console.log('\n=== Mizoram seed complete ===');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
