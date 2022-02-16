import { axe } from 'jest-axe';
import HandlerIndex from 'kesaseteli/handler/pages';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import React from 'react';

describe('frontend/kesaseteli/handler/src/pages/index.tsx', () => {
  it('should not violate accessibility', async () => {
    const {
      renderResult: { container },
    } = renderComponent(<HandlerIndex />, { query: {} });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
