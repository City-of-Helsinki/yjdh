import { fireEvent, screen, waitFor } from '@testing-library/react';
import {
  expectAuthorizedReply,
  expectToLogin,
  expectToLogout,
  expectUnauthorizedReply,
} from 'kesaseteli/employer/__tests__/utils/backend/backend-nocks';
import renderComponent from 'kesaseteli/employer/__tests__/utils/components/render-component';
import getBackendUrl from 'kesaseteli/employer/backend-api/get-backend-url';
import Header from 'kesaseteli/employer/components/header/Header';
import nock from 'nock';
import React from 'react';
import createReactQueryTestClient from 'shared/__tests__/utils/react-query/create-react-query-test-client';
import User from 'shared/types/user';

const clickToLogin = (): void => {
  expectToLogin();
  fireEvent.click(
    screen.getAllByRole('button', {
      name: 'common:header.loginLabel',
    })[0]
  );
};

const clickToLogout = (user: User): void => {
  expectToLogout();
  fireEvent.click(
    screen.getByRole('button', {
      name: new RegExp(`common:header.userAriaLabelPrefix ${user.name}`, 'i'),
    })
  );
  fireEvent.click(
    screen.getAllByRole('link', {
      name: 'common:header.logoutLabel',
    })[0]
  );
};

describe('frontend/kesaseteli/employer/src/components/header/Header.tsx', () => {
  const queryClient = createReactQueryTestClient();
  beforeEach(() => {
    queryClient.clear();
    nock.cleanAll();
  });

  const expectUserIsLoggedIn = async (user: User): Promise<void> => {
    await screen.findByRole('button', {
      name: new RegExp(`common:header.userAriaLabelPrefix ${user.name}`, 'i'),
    });
    await waitFor(() => expect(queryClient.getQueryData('user')).toEqual(user));
  };

  const expectUserIsLoggedOut = async (): Promise<void> => {
    await waitFor(() =>
      expect(
        screen.queryAllByRole('button', {
          name: 'common:header.loginLabel',
        })
      ).toHaveLength(2)
    );
    await waitFor(() =>
      expect(queryClient.getQueryData('user')).toBeUndefined()
    );
  };

  it('Should not show userdata when logged out and redirects to backend when clicked login button', async () => {
    expectUnauthorizedReply();
    const spyRouterPush = jest.fn();
    renderComponent(<Header />, queryClient, { push: spyRouterPush });
    await expectUserIsLoggedOut();
    clickToLogin();
    expect(spyRouterPush).toHaveBeenCalledWith(
      getBackendUrl('/oidc/authenticate/')
    );
  });

  it('Should show userdata when logged in and redirect to logout and clear userdata when clicked logout button', async () => {
    const expectedUser = expectAuthorizedReply(true);
    const spyRouterPush = jest.fn();
    renderComponent(<Header />, queryClient, { push: spyRouterPush });
    await expectUserIsLoggedIn(expectedUser);
    clickToLogout(expectedUser);
    await waitFor(() =>
      expect(queryClient.getQueryData('user')).toBeUndefined()
    );
    expect(spyRouterPush).toHaveBeenCalledWith('/login?logout=true');
  });
});
