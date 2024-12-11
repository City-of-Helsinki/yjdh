import Header from 'kesaseteli/youth/components/header/Header';
import headerApi from 'kesaseteli-shared/__tests__/utils/component-apis/header-api';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import React from 'react';
import { waitFor } from 'shared/__tests__/utils/test-utils';

// Languages need to start with sometning else than 'fi' to avoid the default language
const LANGUAGES = ['sv', 'en', 'fi'] as const;

describe('frontend/kesaseteli/youth/src/components/header/Header.tsx', () => {
  it('can change supported language', async () => {
    const spyRouterPush = jest.fn();
    renderComponent(<Header />, { push: spyRouterPush });
    for (const lang of LANGUAGES) {
      await headerApi.actions.changeLanguage(lang);
      await waitFor(() =>
        expect(spyRouterPush).toHaveBeenCalledWith(undefined, undefined, {
          locale: String(lang),
        })
      );
    }
  });
});
