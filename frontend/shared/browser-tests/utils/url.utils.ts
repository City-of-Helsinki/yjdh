
import TestController, { ClientFunction } from 'testcafe';

import { getSharedComponents } from '../shared.components';
import { getEmployerUiUrl } from './settings';
import { getErrorMessage } from './testcafe.utils';

const getPathname = ClientFunction(() => document.location.pathname);

/* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/explicit-function-return-type */
export const getUrlUtils = (t: TestController) => {
  const pageIsLoaded = async (): Promise<void> => {
    await getSharedComponents(t).loadingSpinner().expectations.isNotPresent();
  };

  const actions = {
    async navigateToFrontPage() {
      await t.navigateTo(getEmployerUiUrl(`/`));
      await pageIsLoaded();
    },
  };
  const expectations = {
    async urlChangedToLandingPage() {
      await t.expect(getPathname()).eql(`/`, await getErrorMessage(t));
    },
  };
  return {
    actions,
    expectations,
  };
};
