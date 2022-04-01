const path = require('path');
const { filterLoggedRequests } = require('@frontend/kesaseteli-shared/browser-tests/utils/request-logger');
const requestLogger = require('@frontend/kesaseteli-shared/browser-tests/utils/request-logger');

module.exports = (envPath) => {
  require('dotenv').config({ path: envPath });
  return {
    hooks: {
      test: {
        afterEach: async (t) => {
          // eslint-disable-next-line no-console
          console.log(filterLoggedRequests(requestLogger))
          const { error, warn } = await t.getBrowserConsoleMessages();
          t.expect(error.length).lt(0, JSON.stringify(error));
          t.expect(warn.length).lt(0, JSON.stringify(error));
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
  };
};

{

}
