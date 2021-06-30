import { screen, waitFor } from '@testing-library/react';
import {
  expectAuthorizedReply,
  expectUnauthorizedReply,
} from 'kesaseteli/employer/__tests__/utils/backend/backend-nocks';
import renderPage from 'kesaseteli/employer/__tests__/utils/components/render-page';
import withAuth from 'kesaseteli/employer/hocs/withAuth';
import React from 'react';
import createReactQueryTestClient from 'shared/__tests__/utils/react-query/create-react-query-test-client';

const Component = (): JSX.Element => <h1>Hello world!</h1>;

describe('frontend/kesaseteli/employer/src/hocs/withAuth.tsx', () => {
  const queryClient = createReactQueryTestClient();
  beforeEach(() => {
    queryClient.clear();
  });

  it('Should show component when authorized', async () => {
    expectAuthorizedReply();
    renderPage(withAuth(Component), queryClient);
    await screen.findByRole('heading', { name: /hello world!/i });
  });

  it('Should redirect when unauthorized', async () => {
    expectUnauthorizedReply();
    const spyPush = jest.fn();
    renderPage(withAuth(Component), queryClient, { push: spyPush });
    await waitFor(() => expect(spyPush).toHaveBeenCalledWith('/login'));
  });
});
