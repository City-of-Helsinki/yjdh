## Environments

Production environment: [https://helsinkilisa.hel.fi](https://helsinkilisa.hel.fi)

Test / dev / stage environments: See main page of project's Confluence page.

In addition, each PR's latest commit is deployed in temporary test environment, see links in GitHub PR's.

## Available Scripts

In the project directory

- frontend/benefit/handler
- frontend/benefit/handler

you can run:

### `yarn next dev --experimental-https -p xxxx`

### `yarn next dev --experimental-https -p xxxx`

Spin up a next dev server with port xxxx. Applicant should use port `3000` and handler should use port `3100`` by default. In order to get certificates working, you might have to allow requests to https://localhost in your browser's advanced configuration: [StackOverflow](https://stackoverflow.com/questions/7580508/getting-chrome-to-accept-self-signed-localhost-certificate)

### `yarn dev` (deprecated)

Runs the app in the development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.
You will also see any lint errors in the console (TODO).

### `yarn build`

Builds the app for production to the `build` folder.

### `yarn benefit-applicant:start`

Runs the built app in the production mode.
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `yarn test`

Launches the test runner in the interactive watch mode.

### `yarn audit`

Audit report for npm packages.
