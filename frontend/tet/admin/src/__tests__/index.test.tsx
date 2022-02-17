import renderComponent from 'tet/admin/__tests__/utils/components/render-component';
import Index from 'tet/admin/pages';
import { axe } from 'jest-axe';
import React from 'react';

describe('frontend/tet/admin/src/pages/index.tsx', () => {
  it('just works!', () => {});
  // TODO enable when axios is properly set for tests
  // it('test for accessibility violations', async () => {
  //   const {
  //     renderResult: { container },
  //   } = renderComponent(<Index />);
  //   const results = await axe(container);
  //   expect(results).toHaveNoViolations();
  // });
});
