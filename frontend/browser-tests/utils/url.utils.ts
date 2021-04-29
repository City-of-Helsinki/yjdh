/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import TestController, { ClientFunction } from 'testcafe';

import { getSharedComponents } from '../shared.components';
import { getEnvUrl } from './settings';
import { getErrorMessage } from './testcafe.utils';

const getPathname = ClientFunction(() => document.location.pathname);

export const getUrlUtils = (t: TestController) => {
  const pageIsLoaded = async () => {
    await getSharedComponents(t).loadingSpinner().expectations.isNotPresent();
  };

  const actions = {
    async navigateToFrontPage() {
      await t.navigateTo(getEnvUrl(`/`));
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
