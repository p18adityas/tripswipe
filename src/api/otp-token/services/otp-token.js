'use strict';

const { createCoreService } = require('@strapi/strapi').factories;
const crypto = require('crypto');

module.exports = createCoreService('api::otp-token.otp-token', ({ strapi }) => ({
  /**
   * Generate a 6-digit OTP code.
   */
  generateCode() {
    return crypto.randomInt(100000, 999999).toString();
  },

  /**
   * Send OTP via Twilio Verify (or log in dev mode).
   */
  async sendOtp(phone) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

    // In development without Twilio, log the code
    if (!accountSid || !serviceSid) {
      const code = this.generateCode();
      strapi.log.warn(`[DEV] OTP for ${phone}: ${code}`);
      return code;
    }

    // In production, use Twilio Verify API
    const twilio = require('twilio')(accountSid, authToken);
    await twilio.verify.v2
      .services(serviceSid)
      .verifications.create({ to: phone, channel: 'sms' });

    return null; // Twilio manages the code
  },

  /**
   * Verify OTP via Twilio Verify (or local check in dev).
   */
  async verifyOtpCode(phone, code) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

    // In development without Twilio, verify against stored code
    if (!accountSid || !serviceSid) {
      return this.verifyLocalOtp(phone, code);
    }

    // In production, use Twilio Verify API
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilio = require('twilio')(accountSid, authToken);

    try {
      const check = await twilio.verify.v2
        .services(serviceSid)
        .verificationChecks.create({ to: phone, code });
      return check.status === 'approved';
    } catch {
      return false;
    }
  },

  /**
   * Local OTP verification for development.
   */
  async verifyLocalOtp(phone, code) {
    const now = new Date();

    const otpRecord = await strapi.db.query('api::otp-token.otp-token').findOne({
      where: {
        phone,
        code,
        verified: false,
        expires_at: { $gt: now.toISOString() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) return false;
    if (otpRecord.attempts >= 5) return false;

    await strapi.db.query('api::otp-token.otp-token').update({
      where: { id: otpRecord.id },
      data: { verified: true },
    });

    return true;
  },

  /**
   * Find or create a user by phone number.
   */
  async findOrCreateUserByPhone(phone) {
    let user = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: { phone },
    });

    if (!user) {
      const defaultRole = await strapi.db.query('plugin::users-permissions.role').findOne({
        where: { type: 'authenticated' },
      });

      user = await strapi.db.query('plugin::users-permissions.user').create({
        data: {
          username: `user_${phone.replace(/\D/g, '').slice(-10)}`,
          email: `${phone.replace(/\D/g, '')}@phone.tripswipe.app`,
          phone,
          phone_verified: true,
          confirmed: true,
          blocked: false,
          role: defaultRole.id,
          provider: 'local',
        },
      });
    }

    return user;
  },

  /**
   * Find or create a user by Google profile.
   */
  async findOrCreateUserByGoogle(googleUser) {
    let user = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: { email: googleUser.email },
    });

    if (!user) {
      const defaultRole = await strapi.db.query('plugin::users-permissions.role').findOne({
        where: { type: 'authenticated' },
      });

      user = await strapi.db.query('plugin::users-permissions.user').create({
        data: {
          username: googleUser.email.split('@')[0],
          email: googleUser.email,
          display_name: googleUser.name,
          confirmed: true,
          blocked: false,
          role: defaultRole.id,
          provider: 'google',
        },
      });
    }

    return user;
  },

  /**
   * Rate limit check: max 3 OTP requests per phone per 10 minutes.
   */
  async checkRateLimit(phone) {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    const recentRequests = await strapi.db.query('api::otp-token.otp-token').count({
      where: {
        phone,
        createdAt: { $gt: tenMinutesAgo.toISOString() },
      },
    });

    return recentRequests < 3;
  },
}));
