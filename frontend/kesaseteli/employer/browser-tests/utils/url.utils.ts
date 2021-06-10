import { getSharedComponents } from '@frontend/shared/browser-tests/shared.components';
import { getErrorMessage } from '@frontend/shared/browser-tests/utils/testcafe.utils';
import TestController, { ClientFunction } from 'testcafe';

import { getEmployerUiUrl } from './settings';

const getCurrentPathname = ClientFunction(() => document.location.pathname);

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
    async urlChangedToLoginPage() {
      await t
        .expect(getCurrentPathname())
        .eql(`/login`, await getErrorMessage(t));
    },
    async urlChangedToCompanyPage() {
      await t
        .expect(getCurrentPathname())
        .eql(`/company`, await getErrorMessage(t));
    },
  };
  return {
    actions,
    expectations,
  };
};
