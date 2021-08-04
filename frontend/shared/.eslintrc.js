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
    'unicorn/no-array-reduce': 'off',
    'react/jsx-pascal-case': ['error', { ignore: ['$*'] }],
  },
  overrides: [
    {
      files: ['*.ts'],
      rules: {
        'import/prefer-default-export': 'off',
      },
    },
    {
      files: ['*.test.tsx'],
      rules: {
        'jest/expect-expect': 'off',
        'jest/no-done-callback': 'off',
        'security/detect-non-literal-regexp': 'off',
        'no-secrets/no-secrets': 'off',
      },
    },
    {
      files: ['*.components.ts'],
      rules: {
        'security/detect-non-literal-fs-filename': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        'testing-library/await-async-query': 'off',
        'security/detect-non-literal-regexp': 'off',
        'no-secrets/no-secrets': 'off',
      },
    },
  ],
};
