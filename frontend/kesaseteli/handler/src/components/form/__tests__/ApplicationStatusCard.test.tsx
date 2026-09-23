import { screen } from '@testing-library/react';
import { APPLICATION_LIST_TYPES } from 'kesaseteli/handler/types/application';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import React from 'react';
import { convertToUIDateAndTimeFormat } from 'shared/utils/date.utils';

import ApplicationStatusCard from '../ApplicationStatusCard';

describe('ApplicationStatusCard', () => {
  const defaultProps = {
    id: 'test-app-id',
    submittedAt: '2026-07-09T10:59:00Z',
    status: <span>Käsittelyssä</span>,
    applicationType: APPLICATION_LIST_TYPES.YOUTH,
    isHandled: false,
  };

  it('renders received date, status, and assignee controls in order', () => {
    renderComponent(<ApplicationStatusCard {...defaultProps} />);

    const dateGroup = screen.getByRole('group', { name: 'Vastaanotettu' });
    expect(dateGroup).toHaveTextContent(
      convertToUIDateAndTimeFormat(defaultProps.submittedAt)
    );

    const statusField = screen.getByTestId('handlerApplication-status');
    expect(statusField).toHaveTextContent('Tila');
    expect(statusField).toHaveTextContent('Käsittelyssä');

    const assigneeField = screen.getByTestId('handlerApplication-assignee-box');
    expect(assigneeField).toHaveTextContent('Käsittelijä');
    expect(
      screen.getByRole('button', { name: /ota käsittelyyn/i })
    ).toBeInTheDocument();
  });

  it('omits assignment controls when isHandled is true', () => {
    renderComponent(<ApplicationStatusCard {...defaultProps} isHandled />);

    expect(screen.getByRole('group', { name: 'Vastaanotettu' })).toBeInTheDocument();
    expect(screen.getByTestId('handlerApplication-status')).toBeInTheDocument();
    expect(
      screen.queryByTestId('handlerApplication-assignee-box')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /ota käsittelyyn/i })
    ).not.toBeInTheDocument();
  });

  it('renders fallback dash when date is missing', () => {
    renderComponent(
      <ApplicationStatusCard {...defaultProps} submittedAt={null} />
    );

    const dateGroup = screen.getByRole('group', { name: 'Vastaanotettu' });
    expect(dateGroup).toHaveTextContent('-');
  });
});
