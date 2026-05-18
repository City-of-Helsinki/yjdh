<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [Kesäseteli Youth UI](#kes%C3%A4seteli-youth-ui)
  - [Introduction](#introduction)
  - [Tech Stack](#tech-stack)
  - [Getting Started](#getting-started)
    - [Development with Docker](#development-with-docker)
    - [Local Development (Without Docker)](#local-development-without-docker)
  - [Scripts](#scripts)
  - [Testing](#testing)
    - [Unit and Integration Tests](#unit-and-integration-tests)
    - [Browser (End-to-End) Tests](#browser-end-to-end-tests)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Kesäseteli Youth UI

User interface for young people (ages 15-18) residing in Helsinki to apply for summer job vouchers (Kesäseteli).

## Introduction

The Kesäseteli Youth UI is a Next.js application integrated into the YJDH monorepo. It provides a user-friendly form where youth can fill in their information, verify their identity, and submit applications to receive their summer job vouchers.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (Page Router)
- **Styling:** [Styled Components](https://styled-components.com/) & [Helsinki Design System (HDS)](https://hds.hel.fi/)
- **State & Forms:** [React Hook Form](https://react-hook-form.com/) & [React Query](https://tanstack.com/query/latest)
- **Testing:** [Jest](https://jestjs.io/) & [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) for Unit/Integration, [Testcafe](https://testcafe.io/) for Browser/E2E testing
- **Authentication:** Suomi.fi / Strong Authentication (via Django Backend Integration)

## Getting Started

### Development with Docker

The easiest way to spin up the Youth UI along with its backend stack is using Docker from the monorepo root.

1. Ensure your `.env.kesaseteli-youth` file exists in the repository root. If not:
   ```bash
   cp .env.kesaseteli-youth.example .env.kesaseteli-youth
   ```
2. Start the development stack from the repository root:
   ```bash
   yarn youth up
   ```
   This will spin up the Youth UI at [http://localhost:3100](http://localhost:3100) and the backend API at `https://localhost:8000`.

### Local Development (Without Docker)

To run the Next.js server locally without Docker (requires Node.js `>=22.13.1 <23.11.0`):

1. Install frontend dependencies from the repository root:
   ```bash
   yarn --cwd frontend install
   ```
2. Start the development server from the `frontend/kesaseteli/youth` directory:
   ```bash
   yarn dev
   ```
   The UI will be accessible at [http://localhost:3100](http://localhost:3100).

## Scripts

Run these scripts from the `frontend/kesaseteli/youth` directory or use `yarn --cwd frontend/kesaseteli/youth <script-name>`:

- `yarn dev`: Starts the Next.js development server at [http://localhost:3100](http://localhost:3100).
- `yarn build`: Builds the production bundle.
- `yarn start`: Starts the Next.js production server.
- `yarn lint`: Runs ESLint checks on `src` and `browser-tests`.
- `yarn typecheck`: Performs TypeScript static type checking.

## Testing

### Unit and Integration Tests

Run unit/integration tests with Jest:

```bash
# Run tests inside this directory
yarn test

# Run tests with coverage report
yarn test:coverage
```

### Browser (End-to-End) Tests

End-to-end tests are written using Testcafe and run against a running development environment.

```bash
# Run browser tests locally (Chrome)
yarn browser-test

# Run browser tests in headless mode (CI)
yarn browser-test:ci
```
