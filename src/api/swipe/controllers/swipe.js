'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::swipe.swipe', ({ strapi }) => ({
  /**
   * GET /api/swipes/feed?city=:id&category=attraction&page=1&pageSize=20
   * Returns places the user has NOT yet swiped on.
   */
  async feed(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const { city, category, page = 1, pageSize = 20 } = ctx.query;

    if (!city) {
      return ctx.badRequest('city query parameter is required');
    }

    // Get IDs of places user has already swiped on
    const existingSwipes = await strapi.db.query('api::swipe.swipe').findMany({
      where: { user: user.id },
      select: ['id'],
      populate: { place: { select: ['id'] } },
    });

    const swipedPlaceIds = existingSwipes
      .filter((s) => s.place)
      .map((s) => s.place.id);

    // Build filter for unswiped places
    const filters = {
      city: city,
      publishedAt: { $notNull: true },
    };

    if (category) {
      filters.category = category;
    }

    if (swipedPlaceIds.length > 0) {
      filters.id = { $notIn: swipedPlaceIds };
    }

    const places = await strapi.db.query('api::place.place').findMany({
      where: filters,
      orderBy: [{ popularity_score: 'desc' }, { createdAt: 'desc' }],
      offset: (page - 1) * pageSize,
      limit: pageSize,
      populate: {
        cover_image: true,
        images: true,
        tags: true,
        location: true,
        cost: true,
        operating_hours: true,
        city: { select: ['id', 'name', 'slug'] },
        country: { select: ['id', 'name', 'code'] },
      },
    });

    const total = await strapi.db.query('api::place.place').count({
      where: filters,
    });

    ctx.body = {
      data: places,
      meta: {
        pagination: {
          page: Number(page),
          pageSize: Number(pageSize),
          pageCount: Math.ceil(total / pageSize),
          total,
        },
      },
    };
  },

  /**
   * POST /api/swipes
   * Record a swipe action.
   * Likes and super-likes are automatically treated as shortlisted.
   */
  async recordSwipe(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const { place, action, trip_context } = ctx.request.body;

    if (!place || !action) {
      return ctx.badRequest('place and action are required');
    }

    const validActions = ['like', 'super-like', 'discard'];
    if (!validActions.includes(action)) {
      return ctx.badRequest(`action must be one of: ${validActions.join(', ')}`);
    }

    // Upsert: update if exists, create if not
    const existing = await strapi.db.query('api::swipe.swipe').findOne({
      where: {
        user: user.id,
        place,
        ...(trip_context ? { trip_context } : {}),
      },
    });

    let swipe;
    if (existing) {
      swipe = await strapi.db.query('api::swipe.swipe').update({
        where: { id: existing.id },
        data: { action },
      });
    } else {
      swipe = await strapi.db.query('api::swipe.swipe').create({
        data: {
          user: user.id,
          place,
          action,
          ...(trip_context ? { trip_context } : {}),
        },
      });
    }

    // Likes and super-likes auto-add to trip's shortlisted_places
    if ((action === 'like' || action === 'super-like') && trip_context) {
      const trip = await strapi.db.query('api::trip.trip').findOne({
        where: { id: trip_context, user: user.id },
        populate: { shortlisted_places: { select: ['id'] } },
      });

      if (trip) {
        const currentIds = trip.shortlisted_places.map((p) => p.id);
        if (!currentIds.includes(place)) {
          await strapi.db.query('api::trip.trip').update({
            where: { id: trip_context },
            data: {
              shortlisted_places: [...currentIds, place],
            },
          });
        }
      }
    }

    // Discard removes from shortlisted_places if it was there
    if (action === 'discard' && trip_context) {
      const trip = await strapi.db.query('api::trip.trip').findOne({
        where: { id: trip_context, user: user.id },
        populate: { shortlisted_places: { select: ['id'] } },
      });

      if (trip) {
        const filtered = trip.shortlisted_places
          .map((p) => p.id)
          .filter((id) => id !== place);
        await strapi.db.query('api::trip.trip').update({
          where: { id: trip_context },
          data: { shortlisted_places: filtered },
        });
      }
    }

    ctx.body = { data: swipe };
  },

  /**
   * POST /api/swipes/undo
   * Undo the last swipe action for the user.
   */
  async undoSwipe(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const { trip_context } = ctx.request.body;

    // Find the most recent swipe
    const lastSwipe = await strapi.db.query('api::swipe.swipe').findOne({
      where: {
        user: user.id,
        ...(trip_context ? { trip_context } : {}),
      },
      orderBy: { createdAt: 'desc' },
      populate: { place: { select: ['id'] } },
    });

    if (!lastSwipe) {
      return ctx.badRequest('No swipe to undo');
    }

    // Delete the swipe
    await strapi.db.query('api::swipe.swipe').delete({
      where: { id: lastSwipe.id },
    });

    // If it was a like/super-like, also remove from shortlisted_places
    if ((lastSwipe.action === 'like' || lastSwipe.action === 'super-like') && trip_context) {
      const trip = await strapi.db.query('api::trip.trip').findOne({
        where: { id: trip_context, user: user.id },
        populate: { shortlisted_places: { select: ['id'] } },
      });

      if (trip && lastSwipe.place) {
        const filtered = trip.shortlisted_places
          .map((p) => p.id)
          .filter((id) => id !== lastSwipe.place.id);
        await strapi.db.query('api::trip.trip').update({
          where: { id: trip_context },
          data: { shortlisted_places: filtered },
        });
      }
    }

    ctx.body = { data: { undone: lastSwipe } };
  },

  /**
   * GET /api/swipes/my?action=like&trip_context=7
   * Returns the authenticated user's swipes, optionally filtered.
   * Use action=liked to get both like and super-like (the "shortlist").
   */
  async mySwipes(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const { action, trip_context } = ctx.query;

    const where = { user: user.id };

    // Special filter: "liked" returns both like and super-like
    if (action === 'liked') {
      where.action = { $in: ['like', 'super-like'] };
    } else if (action) {
      where.action = action;
    }

    if (trip_context) where.trip_context = trip_context;

    const swipes = await strapi.db.query('api::swipe.swipe').findMany({
      where,
      orderBy: { createdAt: 'desc' },
      populate: {
        place: {
          populate: {
            cover_image: true,
            images: true,
            tags: true,
            location: true,
            cost: true,
            city: { select: ['id', 'name'] },
          },
        },
      },
    });

    ctx.body = { data: swipes };
  },
}));
