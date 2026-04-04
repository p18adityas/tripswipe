'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::otp-token.otp-token', ({ strapi }) => ({
  /**
   * POST /api/auth/otp/request
   * Request an OTP code for phone login.
   */
  async requestOtp(ctx) {
    const { phone } = ctx.request.body;

    if (!phone || !/^\+\d{10,15}$/.test(phone)) {
      return ctx.badRequest('Valid phone number required in E.164 format (e.g. +919876543210)');
    }

    const otpService = strapi.service('api::otp-token.otp-token');

    // Rate limit check
    const allowed = await otpService.checkRateLimit(phone);
    if (!allowed) {
      return ctx.tooManyRequests('Too many OTP requests. Try again in 10 minutes.');
    }

    // Send OTP
    try {
      const devCode = await otpService.sendOtp(phone);

      // In dev mode (no Twilio), store the code locally
      if (devCode) {
        await strapi.db.query('api::otp-token.otp-token').create({
          data: {
            phone,
            code: devCode,
            expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
            verified: false,
            attempts: 0,
          },
        });
      }

      ctx.body = { success: true, message: 'OTP sent' };
    } catch (err) {
      strapi.log.error('OTP send error:', err.message);
      return ctx.badRequest(err.message || 'Failed to send OTP');
    }
  },

  /**
   * POST /api/auth/otp/verify
   * Verify OTP and return JWT + user.
   */
  async verifyOtp(ctx) {
    const { phone, code } = ctx.request.body;

    if (!phone || !code) {
      return ctx.badRequest('Phone and code are required');
    }

    const otpService = strapi.service('api::otp-token.otp-token');
    const valid = await otpService.verifyOtpCode(phone, code);

    if (!valid) {
      return ctx.unauthorized('Invalid or expired OTP');
    }

    const user = await otpService.findOrCreateUserByPhone(phone);
    const jwt = strapi.plugin('users-permissions').service('jwt').issue({ id: user.id });

    ctx.body = {
      jwt,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        display_name: user.display_name,
        phone: user.phone,
        profile_setup_complete: user.profile_setup_complete,
      },
    };
  },

  /**
   * POST /api/auth/google
   * Verify Google ID token and return JWT + user.
   */
  async googleSignIn(ctx) {
    const { id_token } = ctx.request.body;

    if (!id_token) {
      return ctx.badRequest('Google ID token is required');
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return ctx.internalServerError('Google Sign-In not configured');
    }

    try {
      const { OAuth2Client } = require('google-auth-library');
      const client = new OAuth2Client(clientId);

      const ticket = await client.verifyIdToken({
        idToken: id_token,
        audience: clientId,
      });

      const payload = ticket.getPayload();

      if (!payload.email_verified) {
        return ctx.unauthorized('Google email not verified');
      }

      const otpService = strapi.service('api::otp-token.otp-token');
      const user = await otpService.findOrCreateUserByGoogle({
        email: payload.email,
        name: payload.name,
      });

      const jwt = strapi.plugin('users-permissions').service('jwt').issue({ id: user.id });

      ctx.body = {
        jwt,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          display_name: user.display_name || payload.name,
          profile_setup_complete: user.profile_setup_complete,
        },
      };
    } catch (err) {
      strapi.log.error('Google Sign-In error:', err);
      return ctx.unauthorized('Invalid Google ID token');
    }
  },

  /**
   * POST /api/auth/signup
   * Email + password signup. Returns JWT + user.
   */
  async emailSignUp(ctx) {
    const { email, password, name } = ctx.request.body;

    if (!email || !password || !name) {
      return ctx.badRequest('email, password, and name are required');
    }

    // Check if user already exists
    const existing = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return ctx.badRequest('Email already registered');
    }

    const defaultRole = await strapi.db.query('plugin::users-permissions.role').findOne({
      where: { type: 'authenticated' },
    });

    // Create user with hashed password via Strapi's user service
    const user = await strapi.plugin('users-permissions').service('user').add({
      username: email.split('@')[0],
      email: email.toLowerCase(),
      password,
      display_name: name,
      confirmed: true,
      blocked: false,
      role: defaultRole.id,
      provider: 'local',
      profile_setup_complete: false,
    });

    const jwt = strapi.plugin('users-permissions').service('jwt').issue({ id: user.id });

    ctx.body = {
      jwt,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        display_name: user.display_name,
        profile_setup_complete: false,
      },
    };
  },

  /**
   * POST /api/auth/signin
   * Email + password sign in. Returns JWT + user.
   */
  async emailSignIn(ctx) {
    const { email, password } = ctx.request.body;

    if (!email || !password) {
      return ctx.badRequest('email and password are required');
    }

    const user = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: { email: email.toLowerCase() },
    });

    if (!user || user.blocked) {
      return ctx.unauthorized('Invalid email or password');
    }

    // Validate password
    const validPassword = await strapi
      .plugin('users-permissions')
      .service('user')
      .validatePassword(password, user.password);

    if (!validPassword) {
      return ctx.unauthorized('Invalid email or password');
    }

    const jwt = strapi.plugin('users-permissions').service('jwt').issue({ id: user.id });

    ctx.body = {
      jwt,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        display_name: user.display_name,
        phone: user.phone,
        nationality: user.nationality,
        country_of_residence: user.country_of_residence,
        profile_setup_complete: user.profile_setup_complete,
      },
    };
  },

  /**
   * POST /api/auth/profile-setup
   * Complete profile setup: basic info, passport, visa.
   * Requires authentication.
   */
  async profileSetup(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const { basicInfo, passport, visa } = ctx.request.body;

    const updates = {};

    if (basicInfo) {
      if (basicInfo.fullName) updates.display_name = basicInfo.fullName;
      if (basicInfo.phone) updates.phone = basicInfo.phone;
      if (basicInfo.nationality) updates.nationality = basicInfo.nationality;
      if (basicInfo.countryOfResidence) updates.country_of_residence = basicInfo.countryOfResidence;
      if (basicInfo.dateOfBirth) updates.date_of_birth = basicInfo.dateOfBirth;
    }

    if (passport) {
      updates.passport = passport;
    }

    if (visa) {
      updates.visa = visa;
    }

    updates.profile_setup_complete = true;

    await strapi.db.query('plugin::users-permissions.user').update({
      where: { id: user.id },
      data: updates,
    });

    const updatedUser = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: { id: user.id },
    });

    ctx.body = {
      success: true,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        display_name: updatedUser.display_name,
        phone: updatedUser.phone,
        nationality: updatedUser.nationality,
        country_of_residence: updatedUser.country_of_residence,
        date_of_birth: updatedUser.date_of_birth,
        passport: updatedUser.passport,
        visa: updatedUser.visa,
        profile_setup_complete: true,
      },
    };
  },
}));
