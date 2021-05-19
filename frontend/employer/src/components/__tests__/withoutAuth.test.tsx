import { screen, waitFor } from '@testing-library/react';
import {
  createQueryClient,
  renderPage,
} from 'employer/__tests__/utils/react-query-utils';
import endpoint from 'employer/backend-api/backend-endpoints';
import getBackendUrl from 'employer/backend-api/backend-url';
import withoutAuth from 'employer/components/withoutAuth';
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
