import { screen } from '@testing-library/react';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import React from 'react';

import AssignmentControls from '../AssignmentControls';

const mockUser = {
  id: 'user-id-123',
  name: 'Current Handler',
};

jest.mock('kesaseteli/handler/hooks/backend/useUserQuery', () => ({
  __esModule: true,
  default: jest.fn(() => ({ data: mockUser })),
}));

describe('AssignmentControls', () => {
  it('renders assign button when unassigned', () => {
    renderComponent(
      <AssignmentControls
        id="app-1"
        assignee={null}
        applicationType="employer"
      />
    );

    expect(
      screen.getByRole('button', { name: /ota käsittelyyn/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /vapauta käsittelystäni/i })
    ).not.toBeInTheDocument();
  });

  it('renders unassign button and displays name when assigned to current user by ID', () => {
    renderComponent(
      <AssignmentControls
        id="app-1"
        assignee={{ id: 'user-id-123', name: 'Current Handler Display' }}
        applicationType="employer"
      />
    );

    expect(screen.getByText('Current Handler Display')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /vapauta käsittelystäni/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /ota käsittelyyn/i })
    ).not.toBeInTheDocument();
  });

  it('renders assign button and displays name when assigned to someone else with different ID even if name matches', () => {
    renderComponent(
      <AssignmentControls
        id="app-1"
        assignee={{ id: 'other-id-456', name: 'Current Handler' }}
        applicationType="employer"
      />
    );

    expect(screen.getByText('Current Handler')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /ota käsittelyyn/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /vapauta käsittelystäni/i })
    ).not.toBeInTheDocument();
  });

  it('renders unassign button when ID matches even if name is different', () => {
    renderComponent(
      <AssignmentControls
        id="app-1"
        assignee={{ id: 'user-id-123', name: 'Different Name But Same ID' }}
        applicationType="employer"
      />
    );

    expect(screen.getByText('Different Name But Same ID')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /vapauta käsittelystäni/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /ota käsittelyyn/i })
    ).not.toBeInTheDocument();
  });
});
