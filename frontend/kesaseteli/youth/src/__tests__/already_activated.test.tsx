import { axe } from 'jest-axe';
import renderComponent from 'kesaseteli/youth/__tests__/utils/components/render-component';
import AlreadyActivatedPage from 'kesaseteli/youth/pages/already_activated';
import React from 'react';

describe('frontend/kesaseteli/youth/src/pages/already_activated.tsx', () => {
  it('should not violate accessibility', async () => {
    const {
      renderResult: { container },
    } = renderComponent(<AlreadyActivatedPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
