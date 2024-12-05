import React from 'react';
import { screen, userEvent, waitFor } from 'shared/__tests__/utils/test-utils';
import { DEFAULT_LANGUAGE } from 'shared/i18n/i18n';
import renderComponent from 'tet/admin/__tests__/utils/components/render-component';
import { getBackendUrl } from 'tet/admin/backend-api/backend-api';
import LoginLinks from 'tet/admin/components/login/LoginLinks';

/* eslint-disable  @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, 
@typescript-eslint/no-unsafe-call, chai-friendly/no-unused-expressions, @typescript-eslint/no-unused-expressions,
@typescript-eslint/no-unsafe-return */
// LoginLinks uses next/dynamic to load HDS Card and needs this to be mocked
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: (...props) => {
    const dynamicModule = jest.requireActual('next/dynamic');
    const dynamicActualComp = dynamicModule.default;
    const RequiredComponent = dynamicActualComp(props[0]);
    RequiredComponent.preload ? RequiredComponent.preload() : RequiredComponent.render.preload();
    return RequiredComponent;
  },
}));
/* eslint-enable */

describe('frontend/tet/admin/src/components/login/LoginLinks', () => {
  it('should handle ADFS and OIDC login', async () => {
    const spyPush = jest.fn();
    renderComponent(<LoginLinks />, { push: spyPush });
    const adfsLoginButton = screen.getByTestId('adfsLoginButton');
    const oidcLoginButton = screen.getByTestId('oidcLoginButton');

    await userEvent.click(adfsLoginButton);

    await waitFor(() =>
      expect(spyPush).toHaveBeenCalledWith(`${getBackendUrl('/oauth2/login')}?lang=${DEFAULT_LANGUAGE}`),
    );

    await userEvent.click(oidcLoginButton);

    await waitFor(() =>
      expect(spyPush).toHaveBeenCalledWith(`${getBackendUrl('/oidc/authenticate/')}?lang=${DEFAULT_LANGUAGE}`),
    );
  });
});
