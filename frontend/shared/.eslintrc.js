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
    'no-void': 'off',
  },
  overrides: [
    {
      files: ['*.ts'],
      rules: {
        'import/prefer-default-export': 'off',
      },
    },
    {
      files: ['*.components.ts'],
      rules: {
        'security/detect-non-literal-fs-filename': 'off',
      },
    },
  ],
};
