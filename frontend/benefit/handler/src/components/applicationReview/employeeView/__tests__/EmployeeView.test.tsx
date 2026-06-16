import { RenderResult, screen } from '@testing-library/react';
import renderComponent from 'benefit/handler/__tests__/utils/render-component';
import { setupUserAndRender } from 'benefit/handler/__tests__/utils/user-render-helper';
import { ApplicationReviewViewProps } from 'benefit/handler/types/application';
import { axe } from 'jest-axe';
import React from 'react';

import EmployeeView from '../EmployeeView';

describe('EmployeeView', () => {
  const initialProps = {
    data: {
      applicationNumber: 1_234_567,
      employee: {
        firstName: 'test first name',
        lastName: 'test last name',
        socialSecurityNumber: '1111111-01',
        isLivingInHelsinki: true,
      },
    },
  };

  const getComponent = (
    props: Partial<ApplicationReviewViewProps> = {}
  ): RenderResult =>
    renderComponent(<EmployeeView {...initialProps} {...props} />).renderResult;

  it('should render with no accessibility violations', async () => {
    const { container } = getComponent();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('opens archive search page with application number', async () => {
    const openSpy = jest
      .spyOn(globalThis, 'open')
      .mockImplementation(() => null);

    const user = setupUserAndRender(() => {
      getComponent();
    });

    await user.click(
      screen.getByRole('button', {
        name: /aiempia tukia/i,
      })
    );

    expect(openSpy).toHaveBeenCalledWith('/archive/?appNo=1234567');

    openSpy.mockRestore();
  });
});
