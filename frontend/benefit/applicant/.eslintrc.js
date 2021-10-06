const { join } = require('path');

module.exports = {
  extends: [
    'auto',
    'next/core-web-vitals',
    'plugin:you-dont-need-lodash-underscore/compatible',
  ],
  rules: {
    'no-secrets/no-secrets': ['error', { tolerance: 4.2 }],
    'sonarjs/cognitive-complexity': ['error', 20],
    'no-void': 'off',
    'unicorn/prefer-module': 'off',
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
    'unicorn/no-array-reduce': 'off',
    'react/jsx-pascal-case': ['error', { ignore: ['$*'] }],
    'chai-friendly/no-unused-expressions': 'off',
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
        'no-await-in-loop': 'off',
        'no-restricted-syntax': 0,
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
