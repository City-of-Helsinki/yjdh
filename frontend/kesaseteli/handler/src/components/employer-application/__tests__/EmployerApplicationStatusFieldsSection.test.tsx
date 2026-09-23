import { screen } from '@testing-library/react';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import { EmployerApplicationStatus } from 'kesaseteli-shared/constants/employer-application-status';
import React from 'react';

import { HANDLED_EMPLOYER_APPLICATION_STATUSES } from '../../../types/application';
import EmployerApplicationStatusSection from '../EmployerApplicationStatusFieldsSection';
import { mockApplicationSingleVoucher } from '../fixtures';

describe('EmployerApplicationStatusFieldsSection', () => {
  it('renders AssignmentControls when application status is not handled', () => {
    renderComponent(
      <EmployerApplicationStatusSection
        application={{
          ...mockApplicationSingleVoucher,
          status: EmployerApplicationStatus.SUBMITTED,
        }}
      />
    );

    expect(
      screen.getByTestId('handlerApplication-assignee')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /ota käsittelyyn/i })
    ).toBeInTheDocument();
  });

  it.each(HANDLED_EMPLOYER_APPLICATION_STATUSES)(
    'omits AssignmentControls when application status is %s',
    (status) => {
      renderComponent(
        <EmployerApplicationStatusSection
          application={{
            ...mockApplicationSingleVoucher,
            status,
            assignee: null,
          }}
        />
      );

      expect(
        screen.queryByTestId('handlerApplication-assignee')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /ota käsittelyyn/i })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /vapauta käsittelystäni/i })
      ).not.toBeInTheDocument();
    }
  );
});
