const path = require('path');

module.exports = (envPath) => {
  require('dotenv').config({ path: envPath,  });
  return {
    hooks: {
      test: {
        before: async (t) => {
          await t.eval(() => document.location.reload());
        },
        after: async (t) => {
          const { error, warn,log, info } = await t.getBrowserConsoleMessages();
          console.log('Console logs:', JSON.stringify(log, null, 2));
          console.info('Console infos:', JSON.stringify(info, null, 2));
          console.warn('Console warnings:', JSON.stringify(warn, null, 2));
          console.error('Console errors:', JSON.stringify(error, null, 2));
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
