
## Environments
Production environment:
[TODO: Add url when deployed]
Project is automatically deployed to production when adding new relase tag, e.g. release-v0.1.0, to repo

Testing environment: [https://<TODO>.test.kuva.hel.ninja](https://<TODO>.test.kuva.hel.ninja)
Project is automatically deployed to testing environment when merging a PR to main branch

## Requirements

- Node 22.x (match with dockerfile: registry.access.redhat.com/ubi9/nodejs-22)
- Yarn
- Git
- Docker

### install node with nvm

    nvm install 22 --lts


## Available Scripts

In the project directory, you can run:

### `yarn dev`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console (TODO).

### `yarn build`

Builds the app for production to the `build` folder.

### `yarn ks-empl:start`

Runs the built app in the production mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `yarn test`

Launches the test runner in the interactive watch mode.

### `yarn audit`

Audit report for npm packages.

#### how to fix audit errors

For example if you got something like this:
┌───────────────┬──────────────────────────────────────────────────────────────┐
│ moderate      │ Regular Expression Denial of Service                         │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Package       │ browserslist                                                 │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Patched in    │ >=4.16.5                                                     │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Dependency of │ @frontend/shared                                             │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Path          │ @frontend/shared > next > browserslist                       │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ More info     │ https://www.npmjs.com/advisories/1747                        │
└───────────────┴──────────────────────────────────────────────────────────────┘

This can be fixed usually by:
Adding `"browserslist" : "^4.16.5"`
to the `"resolutions"` part of the [package.json](./package.json)
Run `yarn`
Then `yarn audit` again and error should be vanished :)

More info: https://stackoverflow.com/questions/51699564/how-to-fix-npm-audit-fix-issues


## testing in Kuva environments

In every pull-request, changed service are deployed to unique url, depending on pull-request number, 
eg. `https://ks-empl-540.test.kuva.hel.ninja` where `540` is pr number and `ks-empl` name of the service

However due to certificate errors, environment does not work with default browser settings: 
You'll get CORS errors and the frontend won't communicate with the backend. 

To fix this, you need to start the chrome browser with special flag which list hashes of 
certificates which are ignored:

   - on Mac Os, run command:
   
    open -a Google\ Chrome --args --ignore-certificate-errors-spki-list="8sg/cl7YabrOFqSqH+Bu0e+P27Av33gWgi8Lq28DW1I=,gJt+wt/T3afCRkxtMMSjXcl/99sgzWc2kk1c1PC9tG0=,zrQI2/1q8i2SRPmMZ1sMntIkG+lMW0legPFokDo3nrY="

   - on Linux: # TODO
   - on windows: # TODO
  
Then go to the url you want to test, for example `https://ks-empl-540.test.kuva.hel.ninja`
and everything should work correctly.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
