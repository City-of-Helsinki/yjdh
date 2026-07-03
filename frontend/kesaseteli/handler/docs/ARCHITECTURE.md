# Kesäseteli Handlers UI Architecture

This document describes the architectural layout and routing structure of the Kesäseteli Handlers UI, primarily focusing on the transition from the legacy MVP handling view to the modern Dashboard structure.

## Overview

The Handlers UI serves two primary roles:
1. **Youth Application Handlers:** Staff members who process and accept/reject youth summer voucher applications.
2. **Employer Application Controllers:** Staff members who process and audit employer applications.

### Legacy MVP vs. Dashboard
Initially, the UI was a minimum viable product (MVP) composed of a single view (`pages/index.tsx`) used to manually accept or reject youth applications using an application ID provided in the URL (as a search parameter, i.e `/?id=...`).

To support listing, sorting, and full application details for both Youth and Employer applications, the architecture was migrated to a Dashboard structure. A feature flag (`NEXT_PUBLIC_ENABLE_HANDLER_NEW_BETA_UI`) allows toggling between the legacy behavior and the new dashboard behavior.

## Core Routing

| Route | Role / Purpose |
|-------|----------------|
| `/` | **Index Router:** Controlled by `next.config.js` `rewrites()` and `redirects()`. If the dashboard is disabled, Next.js natively serves the legacy MVP at `pages/index.tsx` and explicitly blocks access to all new dashboard endpoints via redirects. If enabled, it transparently rewrites requests to `/dashboard`. If accessed with an `?id=xxx` query (from a legacy email link) while the dashboard is enabled, a Next.js `redirects()` rule forwards it directly to the dynamic detail route `/youth-applications/xxx`. |
| `/dashboard` | **Dashboard:** Displays statistical summaries (Pending/Processed) and navigation links to specific application listings. (Served on `/` when enabled). |
| `/youth-applications` | **Youth Listing:** Uses the `ApplicationList` component to render sortable/filterable youth applications. |
| `/youth-applications/[id]` | **Youth Detail:** Displays full application details and includes a sidebar for internal notes. If the dashboard is disabled, a `redirects()` rule forwards requests to the legacy MVP endpoint `/?id=xxx` to preserve the active application context. |
| `/employer-applications` | **Employer Listing:** Uses the `ApplicationList` component to render employer applications. |
| `/employer-applications/[id]` | **Employer Detail:** Displays employer application details and includes the notes sidebar. |

## UI Component Reuse Strategy

To maintain visual consistency with the **Benefit Handlers UI** (which resides in the same monorepo), specific complex components were ported. However, to avoid coupling repositories (as they may be split in the future), we use a "copy and adapt" strategy rather than creating a shared component library.

- **`components/applicationList/ApplicationList.tsx`:** Copied from `benefit/handler/.../ApplicationList.tsx`. It provides HDS-compliant tables, tabs, and filters, but has been stripped of any `benefit-shared` data models and replaced with `kesaseteli-shared` types.
- **`components/sidebar/Sidebar.tsx`:** Copied from `benefit/handler/.../Sidebar.tsx`. Stripped of its messaging functionality, it serves as a pure "Notes" copy-paste board for handlers. Its state is managed locally and tied to the main application form.

## Data Fetching & State

- **React Query** is used for all data fetching.
- **API Endpoints:** Handlers interact with the `YouthApplicationViewSet` and `EmployerApplicationViewSet` in the Django backend.
- **Auth / RBAC:** The UI relies on `useUserQuery().is_staff` to grant access. The backend enforces specific permissions via `EmployerApplicationPermission` and function-level access control.
