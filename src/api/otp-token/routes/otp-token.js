'use strict';

const { createCoreRouter } = require('@strapi/strapi').factories;

// Default CRUD routes (admin use only — not exposed publicly)
module.exports = createCoreRouter('api::otp-token.otp-token');
