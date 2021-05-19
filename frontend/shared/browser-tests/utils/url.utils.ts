import TestController, { ClientFunction } from 'testcafe';

import { getSharedComponents } from '../shared.components';
import { getAuthorizationEndpointUrl, getEmployerUiUrl } from './settings';
import { getErrorMessage } from './testcafe.utils';

const getCurrentPathname = ClientFunction(() => document.location.pathname);
const getCurrentUrl = ClientFunction(() => document.location.href);

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
    async urlChangedToFrontPage() {
      await t.expect(getCurrentPathname()).eql(`/`, await getErrorMessage(t));
    },
    async urlChangedToAuthorizationEndpoint() {
      await t.expect(getCurrentUrl()).contains(getAuthorizationEndpointUrl());
    },
  };
  return {
    actions,
    expectations,
  };
};
