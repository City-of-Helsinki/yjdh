const { join } = require('path');

module.exports = {
  extends: ['auto'],
  rules: {
    'no-secrets/no-secrets': [
      'error',
      { ignoreContent: 'https://makasiini.hel.ninja/delivery' },
    ],
    'import/no-extraneous-dependencies': [
      'error',
      // Use package.json from both this package folder and root.
      { packageDir: [__dirname, join(__dirname, '../')] },
    ],
  },
  overrides: [
    {
      files: ['*.ts'],
      rules: {
        'import/prefer-default-export': 'off',
      },
    },
  ],
};
