import renderComponent from 'tet/admin/__tests__/utils/components/render-component';
import ApplicationPage from 'tet/admin/pages';
import { axe } from 'jest-axe';
import React from 'react';

describe('frontend/tet/admin/src/pages/application.tsx', () => {
  it('test for accessibility violations', async () => {
    const {
      renderResult: { container },
    } = renderComponent(<ApplicationPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
