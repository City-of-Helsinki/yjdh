const { join } = require('path');

module.exports = {
  extends: ['../../.eslintrc.nextjs.js'],
  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      { packageDir: [__dirname, join(__dirname, '../../')] },
    ],
    'no-secrets/no-secrets': ['error', { tolerance: 4.2 }],
  },
  overrides: [
    {
      files: ['validation.ts'],
      rules: {
        'unicorn/no-thenable': 'off',
      },
    },
  ],
};
