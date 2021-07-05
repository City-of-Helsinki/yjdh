import { RenderResult } from '@testing-library/react';
import renderComponent from 'benefit/applicant/__tests__/utils/render-component';
import { APPLICATION_STATUSES } from 'benefit/applicant/constants';
import { ApplicationData } from 'benefit/applicant/types/application';
import faker from 'faker';
import { axe } from 'jest-axe';
import React from 'react';

import ApplicationList, { ApplicationListProps } from '../ApplicationList';

describe('ApplicationList', () => {
  const applicationData: ApplicationData = {
    id: faker.datatype.uuid(),
    status: APPLICATION_STATUSES.DRAFT,
    last_modified_at: faker.date.recent().toDateString(),
    submitted_at: faker.date.past().toDateString(),
    application_number: faker.datatype.number(),
    employee: {
      first_name: faker.name.firstName(),
      last_name: faker.name.lastName(),
    },
  };

  const initialProps: ApplicationListProps = {
    heading: 'Application List',
    data: [applicationData],
    isLoading: false,
  };

  const getComponent = (
    props: Partial<ApplicationListProps> = {}
  ): RenderResult =>
    renderComponent(<ApplicationList {...initialProps} {...props} />);

  it('should render with no accessibility violations in loading state', async () => {
    const { container } = getComponent({ isLoading: true });
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it('should render with no accessibility violations when data is provided', async () => {
    const { container } = getComponent();
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
