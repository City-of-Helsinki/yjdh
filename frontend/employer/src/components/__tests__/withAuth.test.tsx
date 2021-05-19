import { screen, waitFor } from '@testing-library/react';
import {
  createQueryClient,
  renderPage,
} from 'employer/__tests__/utils/react-query-utils';
import endpoint from 'employer/backend-api/backend-endpoints';
import getBackendUrl from 'employer/backend-api/backend-url';
import withAuth from 'employer/components/withAuth';
import User from 'employer/types/user';
import faker from 'faker';
import nock from 'nock';
import React from 'react';

const authenticatedUser: User = {
  ssn: '111111-111C',
  name: faker.name.findName(),
};

const expectAuthorized = (): nock.Scope =>
  nock(getBackendUrl())
    .get(endpoint.USER)
    .reply(200, authenticatedUser, { 'Access-Control-Allow-Origin': '*' });

const expectUnauthorized = (): nock.Scope =>
  nock(getBackendUrl()).get(endpoint.USER).replyWithError('401 Unauthorized');

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
