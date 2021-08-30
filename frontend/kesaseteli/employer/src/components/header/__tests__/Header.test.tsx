import {
  expectAuthorizedReply,
  expectUnauthorizedReply,
} from 'kesaseteli/employer/__tests__/utils/backend/backend-nocks';
import renderComponent from 'kesaseteli/employer/__tests__/utils/components/render-component';
import { getBackendUrl } from 'kesaseteli/employer/backend-api/backend-api';
import Header from 'kesaseteli/employer/components/header/Header';
import React from 'react';
import headerApi from 'shared/__tests__/component-apis/header-api';
import { fakeUser } from 'shared/__tests__/utils/fake-objects';
import createReactQueryTestClient from 'shared/__tests__/utils/react-query/create-react-query-test-client';
import { waitFor } from 'shared/__tests__/utils/test-utils';
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from 'shared/i18n/i18n';

describe('frontend/kesaseteli/employer/src/components/header/Header.tsx', () => {
  it('Redirects to backend when clicked login button', async () => {
    const queryClient = createReactQueryTestClient();
    expectUnauthorizedReply();
    const spyRouterPush = jest.fn();
    renderComponent(<Header />, queryClient, { push: spyRouterPush });
    await headerApi.expectations.userIsLoggedOut();
    headerApi.actions.clickLoginButton();
    await waitFor(() =>
      expect(spyRouterPush).toHaveBeenCalledWith(
        `${getBackendUrl('/oidc/authenticate/')}?lang=${DEFAULT_LANGUAGE}`
      )
    );
  });

  it('Redirects to logout and clear userdata when clicked logout button', async () => {
    const queryClient = createReactQueryTestClient();
    const user = fakeUser();
    expectAuthorizedReply(user);

    const spyRouterPush = jest.fn();
    renderComponent(<Header />, queryClient, { push: spyRouterPush });
    await headerApi.expectations.userIsLoggedIn(user);
    await headerApi.actions.clickLogoutButton(user);
    await waitFor(() =>
      expect(queryClient.getQueryData('user')).toBeUndefined()
    );
    expect(spyRouterPush).toHaveBeenCalledWith('/login?logout=true');
  });

  it('can change supported language', async () => {
    const queryClient = createReactQueryTestClient();
    expectUnauthorizedReply();
    const spyRouterPush = jest.fn();
    renderComponent(<Header />, queryClient, { push: spyRouterPush });
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
