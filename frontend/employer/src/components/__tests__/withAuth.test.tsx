import { screen, waitFor } from '@testing-library/react';
import {
  expectAuthorized,
  expectUnauthorized,
} from 'employer/__tests__/utils/auth-utils';
import {
  createQueryClient,
  renderPage,
} from 'employer/__tests__/utils/react-query-utils';
import withAuth from 'employer/components/withAuth';
import React from 'react';

const Component = (): JSX.Element => <h1>Hello world!</h1>;

describe('frontend/employer/src/components/withAuth.tsx', () => {
  const queryClient = createQueryClient();
  beforeEach(() => {
    queryClient.clear();
  });

  it('Should show component when authorized', async () => {
    expectAuthorized();
    renderPage(withAuth(Component), queryClient);
    await screen.findByRole('heading', { name: /hello world!/i });
  });

  it('Should redirect when unauthorized', async () => {
    expectUnauthorized();
    const spyPush = jest.fn();
    renderPage(withAuth(Component), queryClient, { push: spyPush });
    await waitFor(() => expect(spyPush).toHaveBeenCalledWith('/login'));
  });
});
