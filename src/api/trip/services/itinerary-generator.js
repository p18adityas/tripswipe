'use strict';

/**
 * Itinerary auto-generation service.
 *
 * Takes shortlisted places and distributes them across days using
 * pace setting, geographic proximity, and time-budget constraints.
 * Inserts meal breaks to match the Figma frontend's expected output.
 */

const TRANSIT_BUFFER_HOURS = 0.5;
const DEFAULT_DURATION_HOURS = 2;
const DAY_START_HOUR = 9;
const LUNCH_WINDOW_START = 12;
const LUNCH_WINDOW_END = 14;
const MEAL_DURATION_HOURS = 1;

// Pace controls how many non-stay activities per day
const PACE_LIMITS = {
  relaxed: 3,
  balanced: 4,
  packed: 5,
};

/**
 * Haversine distance between two lat/lng points in kilometers.
 */
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Extract latitude and longitude from a place (which has a location component).
 */
function getCoords(place) {
  if (place.location) {
    return { lat: place.location.latitude || 0, lng: place.location.longitude || 0 };
  }
  return { lat: 0, lng: 0 };
}

/**
 * Format hours as HH:MM:SS time string.
 */
function hoursToTime(hours) {
  const clamped = Math.min(Math.max(hours, 0), 23.99);
  const h = Math.floor(clamped);
  const m = Math.round((clamped - h) * 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
}

/**
 * Nearest-neighbor ordering: given a starting point, visit the closest unvisited place.
 */
function nearestNeighborOrder(places, startLat, startLng) {
  const remaining = [...places];
  const ordered = [];
  let currentLat = startLat;
  let currentLng = startLng;

  while (remaining.length > 0) {
    let nearestIdx = 0;
    let nearestDist = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const coords = getCoords(remaining[i]);
      const dist = haversineKm(currentLat, currentLng, coords.lat, coords.lng);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIdx = i;
      }
    }

    const next = remaining.splice(nearestIdx, 1)[0];
    ordered.push(next);
    const nextCoords = getCoords(next);
    currentLat = nextCoords.lat;
    currentLng = nextCoords.lng;
  }

  return ordered;
}

/**
 * Main itinerary generation function.
 *
 * @param {Array} places - Shortlisted places with populated location, category, duration_hours
 * @param {number} numDays - Number of trip days
 * @param {object} options - { pace: 'relaxed'|'balanced'|'packed' }
 * @returns {Array} Array of itinerary items
 */
function generateItinerary(places, numDays, options = {}) {
  if (!places.length || numDays < 1) return [];

  const pace = options.pace || 'balanced';
  const maxItemsPerDay = PACE_LIMITS[pace] || PACE_LIMITS.balanced;

  // Step 1: Separate stays from non-stays
  const stays = places.filter((p) => p.category === 'stay');
  const nonStays = places.filter((p) => p.category !== 'stay');

  // Step 2: Assign stays to days
  const dayStays = new Array(numDays).fill(null);
  if (stays.length > 0) {
    for (let day = 0; day < numDays; day++) {
      dayStays[day] = stays[Math.min(day, stays.length - 1)];
    }
  }

  // Step 3: Distribute non-stay items across days using pace limit + proximity
  const dayPlaces = Array.from({ length: numDays }, () => []);
  const assigned = new Set();

  for (let day = 0; day < numDays; day++) {
    const stayCoords = dayStays[day] ? getCoords(dayStays[day]) : { lat: 0, lng: 0 };

    // Sort unassigned non-stays by distance to this day's stay
    const candidates = nonStays
      .filter((p) => !assigned.has(p.id))
      .map((p) => ({
        place: p,
        dist: haversineKm(stayCoords.lat, stayCoords.lng, getCoords(p).lat, getCoords(p).lng),
      }))
      .sort((a, b) => a.dist - b.dist);

    let count = 0;
    for (const { place } of candidates) {
      if (count >= maxItemsPerDay) break;
      dayPlaces[day].push(place);
      assigned.add(place.id);
      count++;
    }
  }

  // Step 4: Assign remaining unassigned places across days round-robin
  const unassigned = nonStays.filter((p) => !assigned.has(p.id));
  let dayIdx = 0;
  for (const place of unassigned) {
    dayPlaces[dayIdx % numDays].push(place);
    dayIdx++;
  }

  // Step 5: Order within each day and build timeline with meal breaks
  const itineraryItems = [];

  for (let day = 0; day < numDays; day++) {
    let order = 1;
    let currentHour = DAY_START_HOUR;
    let lunchInserted = false;

    // Add stay as first item if exists
    if (dayStays[day]) {
      itineraryItems.push({
        place: dayStays[day].id,
        day_number: day + 1,
        order_in_day: order++,
        start_time: hoursToTime(currentHour),
        end_time: hoursToTime(currentHour + 1),
        type: 'stay',
      });
      currentHour += 1;
    }

    // Order day's activities by proximity
    const stayCoords = dayStays[day] ? getCoords(dayStays[day]) : { lat: 0, lng: 0 };
    const ordered = nearestNeighborOrder(dayPlaces[day], stayCoords.lat, stayCoords.lng);

    for (const place of ordered) {
      // Insert lunch break if we're in the lunch window and haven't yet
      if (!lunchInserted && currentHour >= LUNCH_WINDOW_START && currentHour < LUNCH_WINDOW_END) {
        itineraryItems.push({
          place: null,
          day_number: day + 1,
          order_in_day: order++,
          start_time: hoursToTime(currentHour),
          end_time: hoursToTime(currentHour + MEAL_DURATION_HOURS),
          type: 'meal',
          notes: 'Lunch break',
        });
        currentHour += MEAL_DURATION_HOURS + TRANSIT_BUFFER_HOURS;
        lunchInserted = true;
      }

      const duration = place.duration_hours || DEFAULT_DURATION_HOURS;
      const startTime = hoursToTime(currentHour);
      currentHour += duration;
      const endTime = hoursToTime(Math.min(currentHour, 23));
      currentHour += TRANSIT_BUFFER_HOURS;

      itineraryItems.push({
        place: place.id,
        day_number: day + 1,
        order_in_day: order++,
        start_time: startTime,
        end_time: endTime,
        type: place.category === 'activity' ? 'activity' : 'attraction',
      });
    }
  }

  return itineraryItems;
}

module.exports = { generateItinerary, haversineKm };
