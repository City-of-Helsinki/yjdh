# Kesäseteli Handlers UI Design Principles

This document defines the overarching design philosophy and UI component strategy for the Kesäseteli Handlers UI.

## Helsinki Design System (HDS)
The user interface stringently follows the [Helsinki Design System (HDS)](https://hds.hel.fi/). All fundamental UI building blocks—such as Buttons, Typography, Containers, Layout Grids, Notifications, and Input Fields—should be sourced directly from `hds-react` or the `shared/components` wrappers that enforce HDS spacing and coloring guidelines.

## Alignment with Benefit Handlers UI
The Kesäseteli Handlers UI aims to mirror the look and feel of the **Benefit Handlers UI** located in the same monorepo (`frontend/benefit/handler`). While they share aesthetic goals, **they do not share component imports** for complex, domain-specific UI patterns.

### Component Isolation Strategy ("Copy, Don't Share")
Because there are long-term plans to separate the Kesäseteli applications from the Benefit applications into entirely different repositories, we strictly avoid moving complex Benefit components into the monorepo's `/shared` directory.

Instead, our strategy is **Copy and Adapt**:
1. Identify the desired UI pattern in `benefit/handler/src/components` (e.g., the `ApplicationList` table or the right-hand `Sidebar`).
2. Copy the component files into `kesaseteli/handler/src/components`.
3. **Strip all Benefit-specific domain logic** (`benefit-shared` types, Ahjo errors, Instalment concepts).
4. **Wire it to Kesäseteli data models** (`kesaseteli-shared` types).

### Specific Ported UI Patterns

#### 1. The Application List Table
- **Visuals:** Uses the HDS `Table` component. It includes sorting capabilities on column headers and pagination at the bottom.
- **Filtering:** Utilizes HDS `Tabs` or radio buttons located above the table to quickly filter the dataset (e.g., "Pending", "Processed").
- **Interaction:** Clicking a row navigates the handler to the detail view of that specific application.

#### 2. The Application Detail Sidebar (Notes)
- **Visuals:** A right-aligned sliding `Drawer` (or inline sidebar depending on layout) modeled after the Benefit UI's messaging sidebar.
- **Functionality (Phase 1):** In Kesäseteli, this sidebar is simplified to function exclusively as a "Notes" section. It serves as a scratchpad or clipboard where handlers can document their process using simple markdown or plain text, without integrating into external messaging platforms.

## Color & Typography
- Follows the core HDS color palette (e.g., Coat of Arms Blue, Black, White).
- Typography strictly adheres to HDS font sizes and weights (Helsinki Grotesk).

## Styling Strategy
- **Always use styled components**: We strictly avoid using the Emotion/Styled-Components inline `css` prop (e.g. `css={...}`) or React inline styles (e.g. `style={{ ... }}`).
- Instead, define descriptive, reusable styled components (prefixed with `$` by convention, e.g., `const $Wrapper = styled.div`...`) either at the top of the component file or in a dedicated styling file (e.g. `ComponentName.sc.ts`).
