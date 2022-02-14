import { RenderResult } from '@testing-library/react';
import renderComponent from 'benefit/handler/__tests__/utils/render-component';
import { ApplicationReviewViewProps } from 'benefit/handler/types/application';
import { axe } from 'jest-axe';
import React from 'react';

import CoOperationNegotiationsView from '../CoOperationNegotiationsView';

describe('BenefitView', () => {
  const initialProps = {
    data: {
      coOperationNegotiations: true,
      coOperationNegotiationsDescription: 'some additional information',
    },
  };

  const getComponent = (
    props: Partial<ApplicationReviewViewProps> = {}
  ): RenderResult =>
    renderComponent(
      <CoOperationNegotiationsView {...initialProps} {...props} />
    ).renderResult;

  it('should render with no accessibility violations', async () => {
    const { container } = getComponent();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
