## Requirements

- Node 18.x (match with dockerfile: helsinkitest/node:18-slim)
- Yarn
- Git
- Docker

### install node

    # For convenience, use node manager (n or nvm, for example)
    n 18
    nvm install 18 --lts

    # Alternative methods
    https://nodejs.org/dist/
    https://nodejs.org/en/download/package-manager

## Testing in temporary PR environments

In every pull request's push, latest commit is deployed to unique url, depending on pull request number,
eg. `https://helsinkilisa-ui-handler-pr2688.dev.hel.ninja` where `2688` is pr number and `helsinkilisa-ui-handler` name of the service

However due to certificate errors, environment does not work with default browser settings:
You'll get CORS errors and the frontend won't communicate with the backend.

To fix this, you need to start the chrome browser with special flag which list hashes of
certificates which are ignored:

- on Mac Os, run command:

  open -a Google\ Chrome --args --ignore-certificate-errors-spki-list="8sg/cl7YabrOFqSqH+Bu0e+P27Av33gWgi8Lq28DW1I=,gJt+wt/T3afCRkxtMMSjXcl/99sgzWc2kk1c1PC9tG0=,zrQI2/1q8i2SRPmMZ1sMntIkG+lMW0legPFokDo3nrY="

- on Linux: # TODO
- on windows: # TODO

Then go to the url you want to test, for example `https://helsinkilisa-ui-handler-pr2688.dev.hel.ninja`
and everything should work correctly.

## Available scripts

In the project directory, you can run:

### `yarn dev`

Runs the app in the development mode.

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.

### `yarn build`

Builds the app for production to the `build` folder.

### `yarn ks-empl:start`

Runs the built app in the production mode.

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `yarn test`

Launches the test runner in the interactive watch mode.

### `yarn audit`

Audit report for npm packages.

#### how to fix audit errors

For example if you got something like this:
┌───────────────┬──────────────────────────────────────────────────────────────┐
│ moderate │ Regular Expression Denial of Service │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Package │ browserslist │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Patched in │ >=4.16.5 │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Dependency of │ @frontend/shared │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Path │ @frontend/shared > next > browserslist │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ More info │ https://www.npmjs.com/advisories/1747 │
└───────────────┴──────────────────────────────────────────────────────────────┘

This can be fixed usually by:
Adding `"browserslist" : "^4.16.5"`
to the `"resolutions"` part of the [package.json](./package.json)
Run `yarn`
Then `yarn audit` again and error should be vanished :)

More info: https://stackoverflow.com/questions/51699564/how-to-fix-npm-audit-fix-issues

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
