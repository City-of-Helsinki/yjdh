import getApplicationPageApi from 'kesaseteli/employer/__tests__/utils/components/get-application-page-api';
import renderPage from 'kesaseteli/employer/__tests__/utils/components/render-page';
import ApplicationPage from 'kesaseteli/employer/pages/application';
import { clearLocalStorage } from 'kesaseteli/employer/utils/localstorage.utils';
import {
  expectAuthorizedReply,
  expectToGetApplicationFromBackend,
} from 'kesaseteli-shared/__tests__/utils/backend/backend-nocks';
import FakeObjectFactory from 'shared/__tests__/utils/FakeObjectFactory';
import SLOW_JEST_TIMEOUT from 'shared/__tests__/utils/slow-jest-timeout';

const fakeObjectFactory = new FakeObjectFactory();

describe('foreign IBAN note', () => {
  afterEach(() => clearLocalStorage('application'));

  it(
    'shows and hides the foreign IBAN note based on the account number',
    async () => {
      const application = fakeObjectFactory.fakeApplication();
      const { id } = application;

      expectAuthorizedReply();
      expectToGetApplicationFromBackend(application);
      renderPage(ApplicationPage, { query: { id } });

      const applicationPage = getApplicationPageApi(application);
      await applicationPage.step1.expectations.stepIsLoaded();

      // Initially Finnish IBAN
      await applicationPage.step1.actions.typeIban('FI1234567890123456');
      await applicationPage.step1.expectations.expectForeignIbanNote(false);

      // Change to foreign IBAN but don't blur yet
      await applicationPage.step1.actions.typeIbanWithoutBlur(
        'DE123456789012345678'
      );
      await applicationPage.step1.expectations.expectForeignIbanNote(false);

      // Now blur (typeIban blurs at the end)
      await applicationPage.step1.actions.typeIban('DE123456789012345678');
      await applicationPage.step1.expectations.expectForeignIbanNote(true);
      await applicationPage.step1.expectations.payslipCustomMessageIsVisible();

      // Change back to Finnish IBAN
      await applicationPage.step1.actions.typeIban('FI9988776655443322');
      await applicationPage.step1.expectations.expectForeignIbanNote(false);
    },
    SLOW_JEST_TIMEOUT
  );
});
