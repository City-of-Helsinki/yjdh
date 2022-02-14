import { RenderResult } from '@testing-library/react';
import renderComponent from 'benefit/handler/__tests__/utils/render-component';
import { ApplicationReviewViewProps } from 'benefit/handler/types/application';
import { axe } from 'jest-axe';
import React from 'react';

import ContactPersonView from '../ContactPersonView';

describe('ContactPersonView', () => {
  const initialProps = {
    data: {
      companyContactPersonFirstName: 'Pekka',
      companyContactPersonLastName: 'Kellokoski',
      companyContactPersonPhoneNumber: '041234567',
      companyContactPersonEmail: 'test@test.com',
    },
  };

  const getComponent = (
    props: Partial<ApplicationReviewViewProps> = {}
  ): RenderResult =>
    renderComponent(<ContactPersonView {...initialProps} {...props} />)
      .renderResult;

  it('should render with no accessibility violations', async () => {
    const { container } = getComponent();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
