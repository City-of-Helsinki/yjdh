<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [Kesäseteli Handler UI](#kes%C3%A4seteli-handler-ui)
  - [Introduction](#introduction)
  - [Authentication & User Roles](#authentication--user-roles)
    - [User Roles](#user-roles)
    - [Authentication](#authentication)
  - [Tech Stack](#tech-stack)
  - [Getting Started](#getting-started)
    - [Development with Docker](#development-with-docker)
    - [Local Development (Without Docker)](#local-development-without-docker)
  - [Feature Flags & Next.js Routing](#feature-flags--nextjs-routing)
    - [Configuration & Build Requirements](#configuration--build-requirements)
    - [Next.js Routing Behavior Table](#nextjs-routing-behavior-table)
  - [Scripts](#scripts)
  - [Testing](#testing)
    - [Unit and Integration Tests](#unit-and-integration-tests)
    - [Browser (End-to-End) Tests](#browser-end-to-end-tests)
  - [Development Guidelines & Architecture Decisions](#development-guidelines--architecture-decisions)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Kesäseteli Handler UI

User interface for application handlers (City of Helsinki staff) of Kesäseteli.

## Introduction

The Kesäseteli Handler UI is a Next.js application integrated into the YJDH monorepo. It provides the backoffice interface where city employees can view, review, search, and approve or reject summer job voucher (Kesäseteli) applications submitted by youth and employers.

## Authentication & User Roles

### User Roles
The application handles two main types of staff roles:
1. **Youth Application Handlers**: Staff members responsible for processing and approving or rejecting summer job voucher applications submitted by youth.
2. **Employer Application Controllers**: Staff members who process, review, and audit summer job voucher applications submitted by employers.

### Authentication
- Authentication is handled using **Active Directory Federation Services (ADFS)** integrated via the Django backend.
- Users must belong to the City of Helsinki organization and be authorized as staff (the backend performs a `is_staff` check on user endpoints).
- **Publicly Available Routes**: Accessible by anonymous users to manage session/consent:
  - `/login` (Sign in page)
  - `/cookie-settings` (Cookie consent settings)
  - `/403`, `/404`, `/500` (Error pages)
- **Authenticated Routes**: All other views (e.g. `/`, `/dashboard`, `/youth-applications`, `/employer-applications`) require active authentication. If a user is not signed in, they are redirected to `/login?sessionExpired=true`.

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
   yarn handler up
   ```
   This will spin up the Handler UI at [http://localhost:3200](http://localhost:3200) and the backend API at `https://localhost:8000`.

### Local Development (Without Docker)

To run the Next.js server locally without Docker (requires Node.js `>=22.13.1 <23.11.0`):

1. Install frontend dependencies from the repository root:
   ```bash
   yarn --cwd frontend install
   ```
2. Start the development server from the `frontend/kesaseteli/handler` directory:
   ```bash
   yarn dev
   ```
   The UI will be accessible at [http://localhost:3200](http://localhost:3200).

## Feature Flags & Next.js Routing

The Handler UI implements a feature flag, `NEXT_PUBLIC_ENABLE_HANDLER_NEW_BETA_UI`, which controls the transition from the legacy MVP page to the modern dashboard/detail views.

### Configuration & Build Requirements
- **Build-Time Variable**: Because Next.js injects variables prefixed with `NEXT_PUBLIC_` during compilation, the value of this flag must be set **at build time** (e.g. inside `.env.kesaseteli-handler` or as a Docker build-arg). Changing this value in runtime environment files will not affect the production build without a full rebuild.
- **Production Default**: The flag is forced to `false` in production deployment pipelines and is enabled on dev/staging environments or by setting it in local `.env.kesaseteli-handler`.

### Next.js Routing Behavior Table
Depending on the flag's state, Next.js performs different rewrites and redirects (configured in `next.config.js`):

| Route Path | Beta UI Enabled (`true`) | Beta UI Disabled (`false`) [Default] |
| :--- | :--- | :--- |
| `/` | **Dashboard**: Transparently rewrites requests to serve `/dashboard` (URL remains as `/`). | **Legacy MVP UI**: Natively serves the single-page processing page (`pages/index.tsx`). |
| `/?id=xxx` | Redirects to `/youth-applications/xxx` (converts legacy email links to new detail path). | Serves Legacy MVP UI for youth application with ID `xxx`. |
| `/dashboard` | Serves dashboard statistics and application listing cards. | Redirects to `/` (blocked). |
| `/youth-applications` | Serves youth application list with search, sorting, and filters. | Redirects to `/` (blocked). |
| `/youth-applications/[id]` | Serves youth application detail review page (with internal notes sidebar). | Redirects to `/?id=[id]` to preserve the active application context in the legacy MVP page. |
| `/employer-applications` | Serves employer application list with search, sorting, and filters. | Redirects to `/` (blocked). |
| `/employer-applications/[id]` | Serves employer application detail review page. | Redirects to `/` (blocked). |

## Scripts

Run these scripts from the `frontend/kesaseteli/handler` directory or use `yarn --cwd frontend/kesaseteli/handler <script-name>`:

- `yarn dev`: Starts the Next.js development server at [http://localhost:3200](http://localhost:3200).
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

## Development Guidelines & Architecture Decisions

Before making modifications to the codebase, you must review the following documentation files, as they represent critical project guidelines, design choices, and architectural standards:

- **[Architecture Decisions (docs/ARCHITECTURE.md)](/frontend/kesaseteli/handler/docs/ARCHITECTURE.md)**: Explains routing structures, index rewriting, and legacy MVP redirection logic.
- **[Code Guidelines (docs/CLAUDE.md)](/frontend/kesaseteli/handler/docs/CLAUDE.md)**: Defines coding rules such as using shared wrapper components, prohibiting inline styles, using route constants, and styling with `styled-components`.
- **[Design Principles (docs/DESIGN.md)](/frontend/kesaseteli/handler/docs/DESIGN.md)**: Outlines Helsinki Design System (HDS) styling rules, component cloning/isolation policies (the "Copy, Don't Share" policy), and custom sidebar logic.
- **[Handler Timeline Diagrams](/backend/kesaseteli/docs/diagrams/)**: Mermaid diagrams covering the timeline data models, note type constraints, API assembly flow, frontend rendering architecture, unified overview, and status change lifecycle. Start with `timeline-05-unified-overview.mmd` for a high-level picture, then drill into the others as needed.
