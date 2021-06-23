import {
  expectAuthorizedReply,
  expectUnauthorizedReply,
} from 'kesaseteli/employer/__tests__/utils/backend/backend-nocks';
import renderPage from 'kesaseteli/employer/__tests__/utils/components/render-page';
import withoutAuth from 'kesaseteli/employer/hocs/withoutAuth';
import React from 'react';
import createReactQueryTestClient from 'shared/__tests__/utils/react-query/create-react-query-test-client';
import { screen, waitFor } from 'test-utils';

const Component = (): JSX.Element => <h1>Hello world!</h1>;

describe('frontend/kesaseteli/employer/src/hocs/withoutAuth.tsx', () => {
  const queryClient = createReactQueryTestClient();
  beforeEach(() => {
    queryClient.clear();
  });

  it('Should show component when unauthorized', async () => {
    expectUnauthorizedReply();
    renderPage(withoutAuth(Component), queryClient);
    await screen.findByRole('heading', { name: /hello world!/i });
  });

  it('Should redirect when authorized', async () => {
    expectAuthorizedReply();
    const spyPush = jest.fn();
    renderPage(withoutAuth(Component), queryClient, { push: spyPush });
    await waitFor(() => expect(spyPush).toHaveBeenCalledWith('/'));
  });
});
