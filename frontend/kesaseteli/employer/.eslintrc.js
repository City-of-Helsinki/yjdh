const { join } = require('path');

module.exports = {
  extends: [
    'auto',
    'next/core-web-vitals',
    'plugin:you-dont-need-lodash-underscore/compatible',
    'plugin:react-hook-form/recommended',
  ],
  rules: {
    'jsx-a11y/anchor-is-valid': [
      'error',
      {
        components: ['Link'],
        specialLink: ['hrefLeft', 'hrefRight'],
        aspects: ['invalidHref', 'preferButton'],
      },
    ],
    'import/no-extraneous-dependencies': [
      'error',
      // Use package.json from both this package folder and root.
      { packageDir: [__dirname, join(__dirname, '../../')] },
    ],
    'no-void': 'off',
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
      files: ['**/__tests__/**', '*.testcafe.ts'],
      rules: {
        'testing-library/render-result-naming-convention': 'off',
        'jest/expect-expect': 'off',
        'jest/no-done-callback': 'off',
        'security/detect-non-literal-regexp': 'off',
        'no-secrets/no-secrets': 'off',
        'no-await-in-loop': 'off',
        'no-restricted-syntax': 0,
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
