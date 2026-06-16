<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [Kesäseteli Handler UI](#kes%C3%A4seteli-handler-ui)
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

# Kesäseteli Handler UI

User interface for application handlers (City of Helsinki staff) of Kesäseteli.

## Introduction

The Kesäseteli Handler UI is a Next.js application integrated into the YJDH monorepo. It provides the backoffice interface where city employees can view, review, search, and approve or reject summer job voucher (Kesäseteli) applications submitted by youth and employers.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (Page Router)
- **Styling:** [Styled Components](https://styled-components.com/) & [Helsinki Design System (HDS)](https://hds.hel.fi/)
- **State & Forms:** [React Hook Form](https://react-hook-form.com/) & [React Query](https://tanstack.com/query/latest)
- **Testing:** [Jest](https://jestjs.io/) & [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) for Unit/Integration, [Testcafe](https://testcafe.io/) for Browser/E2E testing
- **Authentication:** Active Directory Federation Services (ADFS) (via Django Backend Integration)

## Getting Started

### Development with Docker

The easiest way to spin up the Handler UI along with its backend stack is using Docker from the monorepo root.

1. Ensure your `.env.kesaseteli-handler` file exists in the repository root. If not:
   ```bash
   cp .env.kesaseteli-handler.example .env.kesaseteli-handler
   ```
2. Start the development stack from the repository root:
   ```bash
   pnpm handler up
   ```
   This will spin up the Handler UI at [http://localhost:3200](http://localhost:3200) and the backend API at `https://localhost:8000`.

### Local Development (Without Docker)

To run the Next.js server locally without Docker (requires Node.js `>=22.13.1 <23.11.0`):

1. Install frontend dependencies from the repository root:
   ```bash
   pnpm --dir frontend install
   ```
2. Start the development server from the `frontend/kesaseteli/handler` directory:
   ```bash
   pnpm dev
   ```
   The UI will be accessible at [http://localhost:3200](http://localhost:3200).

## Scripts

Run these scripts from the `frontend/kesaseteli/handler` directory or use `pnpm --dir frontend/kesaseteli/handler <script-name>`:

- `pnpm dev`: Starts the Next.js development server at [http://localhost:3200](http://localhost:3200).
- `pnpm build`: Builds the production bundle.
- `pnpm start`: Starts the Next.js production server.
- `pnpm lint`: Runs ESLint checks on `src` and `browser-tests`.
- `pnpm typecheck`: Performs TypeScript static type checking.

## Testing

### Unit and Integration Tests

Run unit/integration tests with Jest:

```bash
# Run tests inside this directory
pnpm test

# Run tests with coverage report
pnpm test:coverage
```

### Browser (End-to-End) Tests

End-to-end tests are written using Testcafe and run against a running development environment.

```bash
# Run browser tests locally (Chrome)
pnpm browser-test

# Run browser tests in headless mode (CI)
pnpm browser-test:ci
```
