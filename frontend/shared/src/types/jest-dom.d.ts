// Type definitions for jest-dom matchers
// setupTests.ts provides the runtime import of '@testing-library/jest-dom'
// This file ensures TypeScript sees the matcher declarations during compilation

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toBeEmptyDOMElement(): R;
      toContainElement(element: HTMLElement | SVGElement | null): R;
      toBeChecked(): R;
      toHaveAccessibleName(expected?: string | RegExp): R;
      toHaveTextContent(expected: string | RegExp): R;
      toHaveAttribute(attr: string, value?: unknown): R;
      toHaveClass(className: string): R;
      toHaveValue(value?: string | number | boolean | string[]): R;
      toBeVisible(): R;
      toBeInvalid(): R;
      toBeValid(): R;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      toHaveStyle(style: string | Record<string, any>): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
    }
  }
}

export {};
