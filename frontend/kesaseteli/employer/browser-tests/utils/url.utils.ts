import { getSharedComponents } from '@frontend/shared/browser-tests/shared.components';
import { getErrorMessage } from '@frontend/shared/browser-tests/utils/testcafe.utils';
import { Language } from '@frontend/shared/src/i18n/i18n';
import TestController, { ClientFunction } from 'testcafe';

import { getEmployerUiUrl } from './settings';

const getCurrentPathname = ClientFunction(() => document.location.pathname);
const getUrlParam = ClientFunction((param: string) => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
});

/* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/explicit-function-return-type */
export const getUrlUtils = (t: TestController) => {
  const pageIsLoaded = async (): Promise<void> => {
    await getSharedComponents(t).loadingSpinner().expectations.isNotPresent();
  };

  const actions = {
    async navigateToIndexPage() {
      await t.navigateTo(getEmployerUiUrl(`/`));
      await pageIsLoaded();
    },
    async navigateToLoginPage() {
      await t.navigateTo(getEmployerUiUrl(`/login`));
      await pageIsLoaded();
    },
    async navigateToCompanyPage() {
      await t.navigateTo(getEmployerUiUrl(`/company`));
      await pageIsLoaded();
    },
  };
  const expectations = {
    async urlChangedToLoginPage(locale: Language = 'fi') {
      await t
        .expect(getCurrentPathname())
        .eql(`/${locale}/login`, await getErrorMessage(t));
    },
    async urlChangedToApplicationPage(locale: Language = 'fi', expectedApplicationId?: string) {
      await t
        .expect(getCurrentPathname())
        .eql(`/${locale}/application`, await getErrorMessage(t));
      const applicationId = await getUrlParam('id') ?? undefined;
      if (expectedApplicationId) {
        await t
          .expect(applicationId).eql(expectedApplicationId, await getErrorMessage(t));
      }
      await t.expect(applicationId).ok(await getErrorMessage(t));
      return applicationId;
    },
  };
  return {
    actions,
    expectations,
  };
};
