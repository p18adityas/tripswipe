'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/trips/my',
      handler: 'trip.myTrips',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/trips/:id/generate-itinerary',
      handler: 'trip.generateItinerary',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/trips/:id/save',
      handler: 'trip.saveTrip',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/trips/:id/archive',
      handler: 'trip.archiveTrip',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/trips/:id/duplicate',
      handler: 'trip.duplicateTrip',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/trips/:id/share',
      handler: 'trip.share',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/trips/shared/:token',
      handler: 'trip.sharedView',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
