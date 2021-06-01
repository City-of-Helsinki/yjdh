import { fireEvent, screen, waitFor } from '@testing-library/react';
import { axe } from 'jest-axe';
import {
  authenticatedUser,
  expectAuthorized,
  expectToLogout,
  expectUnauthorized,
} from 'kesaseteli/employer/__tests__/utils/auth-utils';
import {
  createQueryClient,
  renderPage,
} from 'kesaseteli/employer/__tests__/utils/react-query-utils';
import withAuth from 'kesaseteli/employer/components/withAuth';
import EmployerIndex from 'kesaseteli/employer/pages/index';
import React from 'react';
import { render } from 'test-utils';

describe('frontend/kesaseteli/employer/src/pages/index.tsx', () => {
  const queryClient = createQueryClient();
  beforeEach(() => {
    queryClient.clear();
  });

  it('test for accessibility violations', async () => {
    const { container } = render(<EmployerIndex />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Should redirect when unauthorized', async () => {
    expectUnauthorized();
    const spyPush = jest.fn();
    renderPage(withAuth(EmployerIndex), queryClient, { push: spyPush });
    await waitFor(() => expect(spyPush).toHaveBeenCalledWith('/login'));
  });

  it('Should show component when authorized', async () => {
    expectAuthorized(true);
    renderPage(withAuth(EmployerIndex), queryClient);
    await screen.findByText(new RegExp(authenticatedUser.name, 'i'));
    expect(queryClient.getQueryData('user')).toEqual(authenticatedUser);
  });

  it('Should redirect to logout and clear userdata when clicked logout button', async () => {
    expectAuthorized(true);
    expectToLogout();
    const spyPush = jest.fn();
    renderPage(withAuth(EmployerIndex), queryClient, { push: spyPush });
    await screen.findByText(new RegExp(authenticatedUser.name, 'i'));
    fireEvent.click(
      screen.getByRole('button', {
        name: /kirjaudu ulos/i,
      })
    );
    await waitFor(() =>
      expect(spyPush).toHaveBeenCalledWith('/login?logout=true')
    );
    expect(queryClient.getQueryData('user')).toBeUndefined();
  });
});
