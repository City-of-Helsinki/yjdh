const { join } = require('path');

module.exports = {
  extends: ['../../.eslintrc.base.js'],
  rules: {
    'react/require-default-props': 'off',
    'import/no-extraneous-dependencies': [
      'error',
      { packageDir: [__dirname, join(__dirname, '../../')] },
    ],
  },
};
