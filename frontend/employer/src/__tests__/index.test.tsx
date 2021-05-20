import { screen, waitFor } from '@testing-library/react';
import {
  authenticatedUser,
  expectAuthorized,
  expectUnauthorized,
} from 'employer/__tests__/utils/auth-utils';
import {
  createQueryClient,
  renderPage,
} from 'employer/__tests__/utils/react-query-utils';
import withAuth from 'employer/components/withAuth';
import EmployerIndex from 'employer/pages/index';
import { axe } from 'jest-axe';
import React from 'react';
import { render } from 'test-utils';

describe('frontend/employer/src/pages/index.tsx', () => {
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
    expectAuthorized();
    renderPage(withAuth(EmployerIndex), queryClient);
    await screen.findByText(new RegExp(authenticatedUser.name, 'i'));
  });
});
