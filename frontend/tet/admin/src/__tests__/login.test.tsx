import renderComponent from 'tet/admin/__tests__/utils/components/render-component';
import LoginPage from 'tet/admin/pages/login';
import { axe } from 'jest-axe';
import React from 'react';

jest.mock('next/router', () => ({
  useRouter: () => ({
    prefetch: () => null,
    query: {},
  }),
}));

describe('frontend/tet/admin/src/pages/index.tsx', () => {
  // TODO skipped due to "TypeError: Cannot redefine property: useRouter"
  // TODO maybe try https://www.npmjs.com/package/next-router-mock
  it.skip('should have no accessibility violations', async () => {
    const {
      renderResult: { container },
    } = renderComponent(<LoginPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
