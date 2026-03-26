<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [Voucher UI](#voucher-ui)
- [Handler UI](#handler-ui)
  - [Environments](#environments)
  - [Requirements](#requirements)
    - [install node with nvm](#install-node-with-nvm)
  - [Available Scripts](#available-scripts)
    - [`yarn dev`](#yarn-dev)
    - [`yarn build`](#yarn-build)
    - [`yarn start`](#yarn-start)
    - [`yarn test`](#yarn-test)
  - [Learn More](#learn-more)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Voucher UI

User interface for young people to send summer voucher applications

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

# Handler UI

User interface for application handlers (City of Helsinki users) of Kesäseteli

## Environments

Production environment:
[TODO: Add url when deployed]
Project is automatically deployed to production when adding new release tag, e.g. release-v0.1.0, to repo

Testing environment: [https://<TODO>.test.kuva.hel.ninja](https://<TODO>.test.kuva.hel.ninja)
Project is automatically deployed to testing environment when merging a PR to main branch

## Requirements

- Node 22.x
- Lerna
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

### `yarn start`

Runs the built app in the production mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `yarn test`

Launches the test runner in the interactive watch mode.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
