module.exports = {
  root: true,
  extends: ['auto', 'plugin:you-dont-need-lodash-underscore/compatible'],
  rules: {
    'no-secrets/no-secrets': [
      'error',
      { ignoreContent: 'https://makasiini.hel.ninja/delivery' },
    ],
    'unicorn/no-array-reduce': 'off',
    'unicorn/prefer-export-from': 'off',
    'lodash/prefer-noop': 'off',
    'sonarjs/no-nested-template-literals': 'off',
    'unicorn/prefer-node-protocol': 'off',
    'no-void': 'off',
    'react/function-component-definition': 'off',
    "@typescript-eslint/no-misused-promises": [
      "error",
      {
        "checksVoidReturn": false
      }
    ],
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
    }
  ],
};
