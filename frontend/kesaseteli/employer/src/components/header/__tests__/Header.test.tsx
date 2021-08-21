import {
  expectAuthorizedReply,
  expectToLogin,
  expectToLogout,
  expectUnauthorizedReply,
} from 'kesaseteli/employer/__tests__/utils/backend/backend-nocks';
import renderComponent from 'kesaseteli/employer/__tests__/utils/components/render-component';
import { getBackendUrl } from 'kesaseteli/employer/backend-api/backend-api';
import Header from 'kesaseteli/employer/components/header/Header';
import nock from 'nock';
import React from 'react';
import createReactQueryTestClient from 'shared/__tests__/utils/react-query/create-react-query-test-client';
import { screen, userEvent, waitFor } from 'shared/__tests__/utils/test-utils';
import { Language, SUPPORTED_LANGUAGES } from 'shared/i18n/i18n';
import User from 'shared/types/user';

const translations = {
  fi: 'Suomeksi',
  sv: 'På svenska',
  en: 'In english',
};

const clickToLogin = (): void => {
  expectToLogin();
  userEvent.click(
    screen.getAllByRole('button', {
      name: 'Kirjaudu sisään',
    })[0]
  );
};

const clickToLogout = (user: User): void => {
  expectToLogout();
  userEvent.click(
    screen.getByRole('button', {
      name: `Käyttäjä: ${user.name}`,
    })
  );
  userEvent.click(
    screen.getAllByRole('link', {
      name: 'Kirjaudu ulos',
    })[0]
  );
};

const changeLanguage = (fromLang: Language, toLang: Language): void => {
  userEvent.click(
    screen.getAllByRole('button', {
      name: new RegExp(fromLang, 'i'),
    })[0]
  );
  userEvent.click(
    screen.getAllByRole('link', {
      name: translations[toLang],
    })[0]
  );
};

describe('frontend/kesaseteli/employer/src/components/header/Header.tsx', () => {
  const queryClient = createReactQueryTestClient();
  beforeEach(() => {
    queryClient.clear();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  const expectUserIsLoggedIn = async (user: User): Promise<void> => {
    await screen.findByRole('button', {
      name: `Käyttäjä: ${user.name}`,
    });
    await waitFor(() => expect(queryClient.getQueryData('user')).toEqual(user));
  };

  const expectUserIsLoggedOut = async (): Promise<void> => {
    await waitFor(() =>
      expect(
        screen.queryAllByRole('button', {
          name: 'Kirjaudu sisään',
        })
      ).toHaveLength(2)
    );
    await waitFor(() =>
      expect(queryClient.getQueryData('user')).toBeUndefined()
    );
  };

  it('Redirects to backend when clicked login button', async () => {
    expectUnauthorizedReply();
    const spyRouterPush = jest.fn();
    renderComponent(<Header />, queryClient, { push: spyRouterPush });
    await expectUserIsLoggedOut();
    clickToLogin();
    expect(spyRouterPush).toHaveBeenCalledWith(
      getBackendUrl('/oidc/authenticate/')
    );
  });

  it('Redirects to logout and clear userdata when clicked logout button', async () => {
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

  it('can change supported language', async () => {
    expectUnauthorizedReply(true);
    const spyRouterPush = jest.fn();
    renderComponent(<Header />, queryClient, { push: spyRouterPush });
    await expectUserIsLoggedOut();
    SUPPORTED_LANGUAGES.forEach((lang) => {
      changeLanguage('fi', lang);
      expect(spyRouterPush).toHaveBeenCalledWith(undefined, undefined, {
        locale: String(lang),
        shallow: true,
      });
    });
  });
});
