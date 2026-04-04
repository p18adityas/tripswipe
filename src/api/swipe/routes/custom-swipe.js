'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/swipes/feed',
      handler: 'swipe.feed',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/swipes/my',
      handler: 'swipe.mySwipes',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/swipes',
      handler: 'swipe.recordSwipe',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/swipes/undo',
      handler: 'swipe.undoSwipe',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
