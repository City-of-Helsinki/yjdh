const path = require('path');
module.exports = (envPath) => {
  require('dotenv').config({ path: envPath });

  const timeoutValues = {
    assertionTimeout: process.env.TESTCAFE_ASSERTION_TIMEOUT
      ? parseInt(process.env.TESTCAFE_ASSERTION_TIMEOUT, 10)
      : 60,
    selectorTimeout: process.env.TESTCAFE_SELECTOR_TIMEOUT ? parseInt(process.env.TESTCAFE_SELECTOR_TIMEOUT, 10) : 30,
    ajaxRequestTimeout: process.env.TESTCAFE_AJAX_REQUEST_TIMEOUT
      ? parseInt(process.env.TESTCAFE_AJAX_REQUEST_TIMEOUT, 10)
      : 90,
    pageLoadTimeout: process.env.TESTCAFE_PAGE_LOAD_TIMEOUT
      ? parseInt(process.env.TESTCAFE_PAGE_LOAD_TIMEOUT, 10)
      : 120,
    pageRequestTimeout: process.env.TESTCAFE_PAGE_REQUEST_TIMEOUT
      ? parseInt(process.env.TESTCAFE_PAGE_REQUEST_TIMEOUT, 10)
      : 240,
    browserInitTimeout: process.env.TESTCAFE_BROWSER_INIT_TIMEOUT
      ? parseInt(process.env.TESTCAFE_BROWSER_INIT_TIMEOUT, 10)
      : 240,
  };

  return {
    hooks: {
      test: {
        after: async (t) => {
          if (!process.env.TESTCAFE_SKIP_CONSOLE_LOG) {
            const { error, warn, log, info } = await t.getBrowserConsoleMessages();
            console.log('Console logs:', JSON.stringify(log, null, 2));
            console.info('Console infos:', JSON.stringify(info, null, 2));
            console.warn('Console warnings:', JSON.stringify(warn, null, 2));
            console.error('Console errors:', JSON.stringify(error, null, 2));
          }
        },
      },
    },
    clientScripts: [
      { module: '@testing-library/dom/dist/@testing-library/dom.umd.js' },
      path.join(__dirname, 'testcafeClientErrorHandler.js'),
    ],
    screenshots: {
      takeOnFails: true,
    },
    compilerOptions: {
      typescript: {
        configPath: path.join(__dirname, '/tsconfig.testcafe.json'),
        customCompilerModulePath: path.join(__dirname, '/node_modules/typescript'),
      },
    },
    retryTestPages: true,
    hostname: 'localhost',
    assertionTimeout: timeoutValues.assertionTimeout * 1000,
    selectorTimeout: timeoutValues.selectorTimeout * 1000,
    pageLoadTimeout: timeoutValues.ajaxRequestTimeout * 1000,
    ajaxRequestTimeout: timeoutValues.pageLoadTimeout * 1000,
    pageRequestTimeout: timeoutValues.pageRequestTimeout * 1000,
    browserInitTimeout: timeoutValues.browserInitTimeout * 1000,
  };
};
