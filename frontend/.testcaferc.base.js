const path = require('path');

// known javascript errors and warnings that can be ignored
const whitelistMsgs = ['Warning: Prop `%s` did not match','downshift: A component has changed the uncontrolled prop', 'Using ReactElement as a label is against good usability and accessibility practices']

module.exports = (envPath) => {
  require('dotenv').config({ path: envPath,  });
  return {
    hooks: {
      test: {
        after: async (t) => {
          const { error, warn,log, info } = await t.getBrowserConsoleMessages();
          console.log(JSON.stringify(log, null, 2));
          console.log(JSON.stringify(info, null, 2));
          const filteredErrors = error.filter(err => whitelistMsgs.every(msg => !err.includes(msg)));
          const filteredWarnings = warn.filter(err => whitelistMsgs.every(msg => !err.includes(msg)));
          await t.expect(filteredErrors.length).eql(0, JSON.stringify(filteredErrors, null, 2));
          await t.expect(filteredWarnings.length).eql(0, JSON.stringify(filteredWarnings, null, 2));
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
