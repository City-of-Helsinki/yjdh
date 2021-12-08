import { RenderResult } from '@testing-library/react';
import renderComponent from 'benefit/handler/__tests__/utils/render-component';
import { ApplicationReviewViewProps } from 'benefit/handler/types/application';
import { axe } from 'jest-axe';
import React from 'react';

import EmpoymentView from '../EmpoymentView';

describe('EmpoymentView', () => {
  const initialProps = {
    data: {
      employee: {
        workingHours: 18,
        monthlyPay: 3000,
        otherExpenses: 100,
        vacationMoney: 2000,
        collectiveBargainingAgreement: 'agreement',
      },
    },
  };

  const getComponent = (
    props: Partial<ApplicationReviewViewProps> = {}
  ): RenderResult =>
    renderComponent(<EmpoymentView {...initialProps} {...props} />)
      .renderResult;

  it('should render with no accessibility violations', async () => {
    const { container } = getComponent();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
