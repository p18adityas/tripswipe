'use strict';

const { createCoreController } = require('@strapi/strapi').factories;
const crypto = require('crypto');
const { generateItinerary } = require('../services/itinerary-generator');

module.exports = createCoreController('api::trip.trip', ({ strapi }) => ({
  /**
   * GET /api/trips/my?status=saved
   * List all trips for the authenticated user, optionally filtered by status.
   */
  async myTrips(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const { status } = ctx.query;
    const where = { user: user.id };
    if (status) where.status = status;

    const trips = await strapi.db.query('api::trip.trip').findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      populate: {
        destination: { select: ['id', 'name', 'slug'] },
        country: { select: ['id', 'name', 'code'] },
        cover_image: true,
        shortlisted_places: {
          select: ['id', 'name', 'category'],
          populate: { cover_image: true },
        },
        itinerary_items: {
          populate: {
            place: {
              select: ['id', 'name', 'category'],
              populate: { cover_image: true },
            },
          },
        },
      },
    });

    ctx.body = { data: trips };
  },

  /**
   * POST /api/trips/:id/generate-itinerary
   * Auto-generate a day-wise itinerary from shortlisted places.
   * Respects the trip's pace setting.
   */
  async generateItinerary(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const tripId = ctx.params.id;

    // Fetch trip with shortlisted places
    const trip = await strapi.db.query('api::trip.trip').findOne({
      where: { id: tripId, user: user.id },
      populate: {
        shortlisted_places: {
          populate: { location: true },
        },
        itinerary_items: true,
      },
    });

    if (!trip) {
      return ctx.notFound('Trip not found');
    }

    if (!trip.shortlisted_places || trip.shortlisted_places.length === 0) {
      return ctx.badRequest('No shortlisted places. Swipe and shortlist places first.');
    }

    // Delete existing itinerary items if regenerating
    if (trip.itinerary_items && trip.itinerary_items.length > 0) {
      for (const item of trip.itinerary_items) {
        await strapi.db.query('api::itinerary-item.itinerary-item').delete({
          where: { id: item.id },
        });
      }
    }

    // Generate itinerary with pace setting
    const items = generateItinerary(trip.shortlisted_places, trip.num_days, {
      pace: trip.pace || 'balanced',
    });

    // Create itinerary items
    for (const item of items) {
      await strapi.db.query('api::itinerary-item.itinerary-item').create({
        data: {
          trip: tripId,
          place: item.place,
          day_number: item.day_number,
          order_in_day: item.order_in_day,
          start_time: item.start_time,
          end_time: item.end_time,
          type: item.type,
          notes: item.notes || null,
        },
      });
    }

    // Update trip status
    await strapi.db.query('api::trip.trip').update({
      where: { id: tripId },
      data: { status: 'planned' },
    });

    // Fetch full itinerary with place details
    const fullItems = await strapi.db.query('api::itinerary-item.itinerary-item').findMany({
      where: { trip: tripId },
      orderBy: [{ day_number: 'asc' }, { order_in_day: 'asc' }],
      populate: {
        place: {
          populate: {
            cover_image: true,
            images: true,
            location: true,
            cost: true,
            tags: true,
          },
        },
      },
    });

    ctx.body = { data: { itinerary_items: fullItems } };
  },

  /**
   * POST /api/trips/:id/save
   * Mark a trip as saved.
   */
  async saveTrip(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const tripId = ctx.params.id;

    const trip = await strapi.db.query('api::trip.trip').findOne({
      where: { id: tripId, user: user.id },
    });

    if (!trip) return ctx.notFound('Trip not found');

    const updated = await strapi.db.query('api::trip.trip').update({
      where: { id: tripId },
      data: { status: 'saved' },
    });

    ctx.body = { data: updated };
  },

  /**
   * POST /api/trips/:id/archive
   * Archive a trip.
   */
  async archiveTrip(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const tripId = ctx.params.id;

    const trip = await strapi.db.query('api::trip.trip').findOne({
      where: { id: tripId, user: user.id },
    });

    if (!trip) return ctx.notFound('Trip not found');

    const updated = await strapi.db.query('api::trip.trip').update({
      where: { id: tripId },
      data: { status: 'archived' },
    });

    ctx.body = { data: updated };
  },

  /**
   * POST /api/trips/:id/duplicate
   * Create a copy of an existing trip.
   */
  async duplicateTrip(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const tripId = ctx.params.id;

    const trip = await strapi.db.query('api::trip.trip').findOne({
      where: { id: tripId, user: user.id },
      populate: {
        destination: true,
        country: true,
        shortlisted_places: { select: ['id'] },
        itinerary_items: true,
      },
    });

    if (!trip) return ctx.notFound('Trip not found');

    // Create the duplicate
    const newTrip = await strapi.db.query('api::trip.trip').create({
      data: {
        name: `${trip.name} (Copy)`,
        user: user.id,
        destination: trip.destination?.id || null,
        country: trip.country?.id || null,
        num_days: trip.num_days,
        num_travelers: trip.num_travelers,
        start_date: trip.start_date,
        end_date: trip.end_date,
        pace: trip.pace,
        budget: trip.budget,
        food_preference: trip.food_preference,
        status: 'draft',
        share_token: crypto.randomUUID(),
        shortlisted_places: trip.shortlisted_places.map((p) => p.id),
      },
    });

    // Duplicate itinerary items
    if (trip.itinerary_items) {
      for (const item of trip.itinerary_items) {
        await strapi.db.query('api::itinerary-item.itinerary-item').create({
          data: {
            trip: newTrip.id,
            place: item.place,
            day_number: item.day_number,
            order_in_day: item.order_in_day,
            start_time: item.start_time,
            end_time: item.end_time,
            notes: item.notes,
            type: item.type,
          },
        });
      }
    }

    ctx.body = { data: newTrip };
  },

  /**
   * POST /api/trips/:id/share
   * Generate a shareable link for a trip. Marks status as 'shared'.
   */
  async share(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const tripId = ctx.params.id;

    const trip = await strapi.db.query('api::trip.trip').findOne({
      where: { id: tripId, user: user.id },
    });

    if (!trip) return ctx.notFound('Trip not found');

    // Generate share token if not exists
    let shareToken = trip.share_token;
    if (!shareToken) {
      shareToken = crypto.randomUUID();
    }

    await strapi.db.query('api::trip.trip').update({
      where: { id: tripId },
      data: { share_token: shareToken, is_public: true, status: 'shared' },
    });

    const baseUrl = process.env.APP_URL || `http://localhost:${process.env.PORT || 1337}`;

    ctx.body = {
      share_token: shareToken,
      share_url: `${baseUrl}/trip/${shareToken}`,
    };
  },

  /**
   * GET /api/trips/shared/:token
   * Public read-only view of a shared trip.
   */
  async sharedView(ctx) {
    const { token } = ctx.params;

    const trip = await strapi.db.query('api::trip.trip').findOne({
      where: { share_token: token, is_public: true },
      populate: {
        destination: { select: ['id', 'name', 'slug'] },
        country: { select: ['id', 'name', 'code'] },
        cover_image: true,
        itinerary_items: {
          populate: {
            place: {
              populate: {
                cover_image: true,
                images: true,
                location: true,
                cost: true,
                tags: true,
              },
            },
          },
        },
      },
    });

    if (!trip) return ctx.notFound('Shared trip not found');

    // Sort itinerary items
    if (trip.itinerary_items) {
      trip.itinerary_items.sort((a, b) =>
        a.day_number !== b.day_number
          ? a.day_number - b.day_number
          : a.order_in_day - b.order_in_day
      );
    }

    // Strip user details from public view
    const { user, ...publicTrip } = trip;

    ctx.body = { data: publicTrip };
  },
}));
