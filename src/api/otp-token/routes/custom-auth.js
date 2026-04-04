'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/auth/otp/request',
      handler: 'otp-token.requestOtp',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/auth/otp/verify',
      handler: 'otp-token.verifyOtp',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/auth/google',
      handler: 'otp-token.googleSignIn',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/auth/signup',
      handler: 'otp-token.emailSignUp',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/auth/signin',
      handler: 'otp-token.emailSignIn',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/auth/profile-setup',
      handler: 'otp-token.profileSetup',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
