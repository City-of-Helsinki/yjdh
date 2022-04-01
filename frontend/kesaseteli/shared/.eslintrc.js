const { join } = require('path');

module.exports = {
  extends: ['../../.eslintrc.base.js'],
  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      { packageDir: [__dirname, join(__dirname, '../../')] },
    ],
  },
};
