'use strict';

const crypto = require('crypto');

module.exports = {
  beforeCreate(event) {
    // Auto-generate share_token on trip creation
    if (!event.params.data.share_token) {
      event.params.data.share_token = crypto.randomUUID();
    }
  },
};
