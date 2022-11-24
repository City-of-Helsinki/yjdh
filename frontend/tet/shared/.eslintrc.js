const { join } = require('path');

module.exports = {
  extends: ['../../.eslintrc.jsx.js'],
  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      { packageDir: [__dirname, join(__dirname, '../../')] },
    ],
  },
};
