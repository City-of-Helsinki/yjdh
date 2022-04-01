const { waitForReact } = require('testcafe-react-selectors');
const path = require('path');

module.exports = (envPath) => {
  require('dotenv').config({ path: envPath });
  return {
    hooks: {
      test: {
        before: async (t) => {
          await waitForReact(45_000, t);
        },
        afterEach: async (t) => {
          const { error, warn, log, info } = await t.getBrowserConsoleMessages();
          console.log('BROWSER CONSOLE MESSAGES:');
          console.error(error);
          console.warn(warn);
          console.log(log);
          console.info(info);
        }

      },
    },
    clientScripts: [
      { module: '@testing-library/dom/dist/@testing-library/dom.umd.js' },
      path.join(__dirname, 'testcafeClientErrorHandler.js')
    ],
    screenshots: {
      takeOnFails: true
    },
    compilerOptions: {
      typescript: {
        configPath: path.join(__dirname, '/tsconfig.testcafe.json'),
        customCompilerModulePath:  path.join(__dirname, '/node_modules/typescript')
      }
    },
    assertionTimeout: 5000,
    selectorTimeout: 30_000,
    pageLoadTimeout: 120_000,
    ajaxRequestTimeout: 120_000,
    pageRequestTimeout: 90_000,
    browserInitTimeout: 240_000
  };
};

{

}
