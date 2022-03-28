const { waitForReact } = require('testcafe-react-selectors');
const path = require('path');

module.exports = (envPath) => {
  require('dotenv').config({ path: envPath });
  return {
    hooks: {
      test: {
        before: async (t) => {
          await waitForReact(20_000, t);
        },

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
    pageRequestTimeout: 20_000
  };
};

{

}
