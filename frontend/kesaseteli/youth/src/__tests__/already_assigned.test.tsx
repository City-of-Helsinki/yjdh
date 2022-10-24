import { axe } from 'jest-axe';
import renderComponent from 'kesaseteli/youth/__tests__/utils/components/render-component';
import AlreadyAssignedPage from 'kesaseteli/youth/pages/already_assigned';
import React from 'react';

describe('frontend/kesaseteli/youth/src/pages/already_assigned.tsx', () => {
  it('should not violate accessibility', async () => {
    const {
      renderResult: { container },
    } = renderComponent(<AlreadyAssignedPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
