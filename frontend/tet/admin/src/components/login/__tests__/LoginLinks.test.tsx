import React from 'react';
import renderComponent from 'tet/admin/__tests__/utils/components/render-component';
import LoginLinks from 'tet/admin/components/login/LoginLinks';
import { screen, userEvent, waitFor } from 'shared/__tests__/utils/test-utils';
import { DEFAULT_LANGUAGE } from 'shared/i18n/i18n';
import { getBackendUrl } from 'tet/admin/backend-api/backend-api';

describe('frontend/tet/admin/src/components/login/LoginLinks', () => {
  it('should handle ADFS and OIDC login', async () => {
    const spyPush = jest.fn();
    renderComponent(<LoginLinks />, { push: spyPush });
    const adfsLoginButton = screen.getByTestId('adfsLoginButton');
    const oidcLoginButton = screen.getByTestId('oidcLoginButton');

    userEvent.click(adfsLoginButton);

    await waitFor(() =>
      expect(spyPush).toHaveBeenCalledWith(`${getBackendUrl('/oauth2/login')}?lang=${DEFAULT_LANGUAGE}`),
    );

    userEvent.click(oidcLoginButton);

    await waitFor(() =>
      expect(spyPush).toHaveBeenCalledWith(`${getBackendUrl('/oidc/authenticate/')}?lang=${DEFAULT_LANGUAGE}`),
    );
  });
});
