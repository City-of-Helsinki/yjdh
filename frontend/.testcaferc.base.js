const path = require('path');

module.exports = (envPath) => {
  require('dotenv').config({ path: envPath,  });
  return {
    hooks: {
      test: {
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
    retryTestPages: true,
    hostname: 'localhost',
    ...(process.env.CI === 'True' && {
      assertionTimeout: 60_000,
      selectorTimeout: 60_000,
      pageLoadTimeout: 120_000,
      ajaxRequestTimeout: 60_000,
      pageRequestTimeout: 240_000,
      browserInitTimeout: 240_000
    }),
  };
};

{

}
