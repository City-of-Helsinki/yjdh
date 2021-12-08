import { RenderResult } from '@testing-library/react';
import renderComponent from 'benefit/handler/__tests__/utils/render-component';
import { BENEFIT_TYPES } from 'benefit/handler/constants';
import { ApplicationReviewViewProps } from 'benefit/handler/types/application';
import { axe } from 'jest-axe';
import React from 'react';

import BenefitView from '../BenefitView';

describe('BenefitView', () => {
  const initialProps = {
    data: {
      benefitType: BENEFIT_TYPES.EMPLOYMENT,
      startDate: '21-01-2021',
      endDate: '30-01-2021',
    },
  };

  const getComponent = (
    props: Partial<ApplicationReviewViewProps> = {}
  ): RenderResult =>
    renderComponent(<BenefitView {...initialProps} {...props} />).renderResult;

  it('should render with no accessibility violations', async () => {
    const { container } = getComponent();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
