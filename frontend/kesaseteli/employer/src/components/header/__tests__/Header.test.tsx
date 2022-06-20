import Header from 'kesaseteli/employer/components/header/Header';
import {
  expectAuthorizedReply,
  expectUnauthorizedReply,
} from 'kesaseteli-shared/__tests__/utils/backend/backend-nocks';
import headerApi from 'kesaseteli-shared/__tests__/utils/component-apis/header-api';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import { getBackendUrl } from 'kesaseteli-shared/backend-api/backend-api';
import React from 'react';
import FakeObjectFactory from 'shared/__tests__/utils/FakeObjectFactory';
import { waitFor } from 'shared/__tests__/utils/test-utils';
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from 'shared/i18n/i18n';

const fakeObjectFactory = new FakeObjectFactory();

describe('frontend/kesaseteli/employer/src/components/header/Header.tsx', () => {
  it('Redirects to backend when clicked login button', async () => {
    expectUnauthorizedReply();
    const spyRouterPush = jest.fn();
    renderComponent(<Header />, { push: spyRouterPush });
    await headerApi.expectations.userIsLoggedOut();
    headerApi.actions.clickLoginButton();
    await waitFor(() =>
      expect(spyRouterPush).toHaveBeenCalledWith(
        `${getBackendUrl('/oidc/authenticate/')}?lang=${DEFAULT_LANGUAGE}`
      )
    );
  });

  it('Userdata is cleared when clicked logout button', async () => {
    const user = fakeObjectFactory.fakeUser();
    expectAuthorizedReply(user);
    const spyRouterPush = jest.fn();
    const { queryClient } = renderComponent(<Header />, {
      push: spyRouterPush,
    });
    await headerApi.expectations.userIsLoggedIn(user);
    headerApi.actions.clickLogoutButton(user);
    await waitFor(() =>
      expect(spyRouterPush).toHaveBeenCalledWith(
        `${getBackendUrl('/oidc/logout/')}`
      )
    );
    await waitFor(() =>
      expect(queryClient.getQueryData('user')).toBeUndefined()
    );
  });

  it('can change supported language', async () => {
    expectUnauthorizedReply();
    const spyRouterPush = jest.fn();
    renderComponent(<Header />, { push: spyRouterPush });
    await headerApi.expectations.userIsLoggedOut();
    for (const lang of SUPPORTED_LANGUAGES) {
      headerApi.actions.changeLanguage('fi', lang);
      await waitFor(() =>
        expect(spyRouterPush).toHaveBeenCalledWith(undefined, undefined, {
          locale: String(lang),
        })
      );
    }
  });
});
