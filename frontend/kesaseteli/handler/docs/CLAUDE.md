# Kesäseteli Handler UI Code Guidelines

Follow these guidelines when modifying or adding code to the Kesäseteli Handler frontend application:

## Component & Code Guidelines

### 1. Always Use Shared Wrapper Components
- **Buttons**: Do not use raw HTML `<button>` elements styled with HDS classes. Always import and use the custom `Button` wrapper component from `shared/components/button/Button` (which extends HDS `ButtonProps` with support for loading states).

### 2. Avoid Inline Styling
- Do not use React `style={{ ... }}` props for styling components. Use `styled-components` to declare layout wrappers and styles (e.g., prefixing styled wrappers with `$` as in `const $CardContainer = styled.div...`).

### 3. Use Route Constants
- Do not use hardcoded string paths for page routing (e.g., `'/youth-applications'`). Import and use `ROUTES` from `kesaseteli-shared/constants/routes`.

### 4. Enforce Localization
- Do not write hardcoded text strings (like `"Pending: — \nProcessed: —"`) in your components. All UI texts must be localized using `useTranslation` and defined in `public/locales/fi/common.json`.

### 5. Type-Safe React Query Hooks
- When writing custom query hooks that forward `options?: UseQueryOptions<T>`, cast the query key (if it is a literal string from `BackendEndpoint`) to `QueryKey` (imported from `react-query`) in the `useQuery` call. This prevents TypeScript overload resolution errors where a broad `QueryKey` from options is incompatible with a narrow string literal.
