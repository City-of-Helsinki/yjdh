const { CLIEngine } = require('eslint');

const cli = new CLIEngine({});

/**
 * ESLint throws out warning:
 * "File ignored because of a matching ignore pattern. Use "--no-ignore" to override"
 * that breaks the linting process when --max-warnings=0 is set.
 * Based on the discussion from this issue: https://github.com/eslint/eslint/issues/9977,
 * it seems that using the outlined script is the best route to fix this: https://github.com/eslint/eslint/issues/9977#issuecomment-406420893
 * See also: https://openbase.io/js/lint-staged/documentation
 */
module.exports = {
  './**/*.{ts,tsx,js,jsx}': [
    (changedFiles) =>
      'eslint --fix --max-warnings=0 ' +
      changedFiles.filter((file) => !cli.isPathIgnored(file)).join(' '),
    'yarn test:staged',
    'prettier --write',
  ],
};
