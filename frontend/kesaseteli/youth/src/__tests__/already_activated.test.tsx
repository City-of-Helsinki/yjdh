import { axe } from 'jest-axe';
import AlreadyActivatedPage from 'kesaseteli/youth/pages/already_activated';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
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
