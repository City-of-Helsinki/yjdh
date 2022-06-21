import Header from 'kesaseteli/youth/components/header/Header';
import headerApi from 'kesaseteli-shared/__tests__/utils/component-apis/header-api';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import React from 'react';
import { waitFor } from 'shared/__tests__/utils/test-utils';
import { SUPPORTED_LANGUAGES } from 'shared/i18n/i18n';

describe('frontend/kesaseteli/youth/src/components/header/Header.tsx', () => {
  it('can change supported language', async () => {
    const spyRouterPush = jest.fn();
    renderComponent(<Header />, { push: spyRouterPush });
    for (const lang of SUPPORTED_LANGUAGES) {
      await headerApi.actions.changeLanguage('fi', lang);
      await waitFor(() =>
        expect(spyRouterPush).toHaveBeenCalledWith(undefined, undefined, {
          locale: String(lang),
        })
      );
    }
  });
});
