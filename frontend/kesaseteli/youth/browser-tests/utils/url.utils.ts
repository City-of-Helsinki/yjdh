import { getBackendUrl } from '@frontend/kesaseteli-shared/src/backend-api/backend-api';
import {
  getErrorMessage,
  screenContext,
} from '@frontend/shared/browser-tests/utils/testcafe.utils';
import { getUrl } from '@frontend/shared/browser-tests/utils/url.utils';
import TestController, { ClientFunction } from 'testcafe';

export const getFrontendUrl = (path = ''): string =>
  getUrl(process.env.YOUTH_URL ?? 'https://localhost:3100', path);

const getCurrentUrl = ClientFunction(() => document.location.href);

/* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/explicit-function-return-type */
export const getUrlUtils = (t: TestController) => {
  const screen = screenContext(t);
  const actions = {};
  const expectations = {
    async urlChangedToActivatedPage() {
      await t
        .expect(getCurrentUrl())
        .contains(
          `${getBackendUrl('/v1/youthapplications/')}`,
          await getErrorMessage(t)
        );
      await t
        // eslint-disable-next-line testing-library/await-async-query
        .expect(screen.findByText('Youth application activated').exists)
        .ok(await getErrorMessage(t), { timeout: 20_000 });
    },
    async urlChangedToExpirationPage() {
      await t
        .expect(getCurrentUrl())
        .contains(
          `${getBackendUrl('/v1/youthapplications/')}`,
          await getErrorMessage(t)
        );
      await t
        // eslint-disable-next-line testing-library/await-async-query
        .expect(screen.findByText('Activation link has expired').exists)
        .ok(await getErrorMessage(t), { timeout: 20_000 });
    },
  };
  return {
    actions,
    expectations,
  };
};
