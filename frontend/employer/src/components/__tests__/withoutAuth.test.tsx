import { screen, waitFor } from '@testing-library/react';
import {
  expectAuthorized,
  expectUnauthorized,
} from 'employer/__tests__/utils/auth-utils';
import {
  createQueryClient,
  renderPage,
} from 'employer/__tests__/utils/react-query-utils';
import withoutAuth from 'employer/components/withoutAuth';
import React from 'react';

const Component = (): JSX.Element => <h1>Hello world!</h1>;

describe('frontend/employer/src/components/withoutAuth.tsx', () => {
  const queryClient = createQueryClient();
  beforeEach(() => {
    queryClient.clear();
  });

  it('Should show component when unauthorized', async () => {
    expectUnauthorized();
    renderPage(withoutAuth(Component), queryClient);
    await screen.findByRole('heading', { name: /hello world!/i });
  });

  it('Should redirect when authorized', async () => {
    expectAuthorized();
    const spyPush = jest.fn();
    renderPage(withoutAuth(Component), queryClient, { push: spyPush });
    await waitFor(() => expect(spyPush).toHaveBeenCalledWith('/'));
  });
});
