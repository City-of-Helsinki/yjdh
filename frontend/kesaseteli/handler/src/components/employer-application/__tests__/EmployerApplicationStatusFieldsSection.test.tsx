import { screen } from '@testing-library/react';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import FakeObjectFactory from 'kesaseteli-shared/__tests__/utils/FakeObjectFactory';
import { EmployerApplicationStatus } from 'kesaseteli-shared/constants/employer-application-status';
import React from 'react';

import { HANDLED_EMPLOYER_APPLICATION_STATUSES } from '../../../types/application';
import EmployerApplicationStatusSection from '../EmployerApplicationStatusFieldsSection';

describe('EmployerApplicationStatusFieldsSection', () => {
  const fakeObjectFactory = new FakeObjectFactory();

  it('renders AssignmentControls inside $AssigneeBox when application status is not handled', () => {
    const application = fakeObjectFactory.fakeHandlerEmployerApplication({
      status: EmployerApplicationStatus.SUBMITTED,
    });
    renderComponent(
      <EmployerApplicationStatusSection application={application} />
    );

    expect(
      screen.getByTestId('handlerApplication-assignee-box')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /ota käsittelyyn/i })
    ).toBeInTheDocument();
  });

  it.each(HANDLED_EMPLOYER_APPLICATION_STATUSES)(
    'omits AssignmentControls when application status is %s',
    (status) => {
      const application = fakeObjectFactory.fakeHandlerEmployerApplication({
        status,
        assignee: null,
      });
      renderComponent(
        <EmployerApplicationStatusSection application={application} />
      );

      expect(
        screen.queryByTestId('handlerApplication-assignee-box')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /ota käsittelyyn/i })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /vapauta käsittelystäni/i })
      ).not.toBeInTheDocument();
    }
  );

  it('renders status as a StatusLabel pill', () => {
    const application = fakeObjectFactory.fakeHandlerEmployerApplication({
      status: EmployerApplicationStatus.SUBMITTED,
    });
    renderComponent(
      <EmployerApplicationStatusSection application={application} />
    );

    expect(screen.getByText('Uusi hakemus')).toBeInTheDocument();
  });
});
