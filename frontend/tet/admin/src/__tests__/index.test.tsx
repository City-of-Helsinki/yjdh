import renderComponent from 'tet/admin/__tests__/utils/components/render-component';
import IndexPage from 'tet/admin/pages';
import { axe } from 'jest-axe';
import React from 'react';

describe('frontend/tet/admin/src/pages/index.tsx', () => {
  it('test for accessibility violations', async () => {
    const {
      renderResult: { container },
    } = renderComponent(<IndexPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
