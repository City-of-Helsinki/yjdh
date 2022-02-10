import { axe } from 'jest-axe';
import getAlreadyAssignedPageApi from 'kesaseteli/youth/__tests__/utils/components/get-already-assigned-page-api';
import renderPage from 'kesaseteli/youth/__tests__/utils/components/render-page';
import AlreadyAssignedPage from 'kesaseteli/youth/pages/already_assigned';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
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
