module.exports = ({ env }) => ({
  upload: {
    config: {
      provider: env('UPLOAD_PROVIDER', 'local'),
      ...(env('UPLOAD_PROVIDER') === 'cloudinary' && {
        provider: '@strapi/provider-upload-cloudinary',
        providerOptions: {
          cloud_name: env('CLOUDINARY_NAME'),
          api_key: env('CLOUDINARY_KEY'),
          api_secret: env('CLOUDINARY_SECRET'),
        },
        actionOptions: {
          upload: {},
          uploadStream: {},
          delete: {},
        },
      }),
    },
  },
  'users-permissions': {
    config: {
      jwt: {
        expiresIn: '7d',
      },
    },
  },
});
