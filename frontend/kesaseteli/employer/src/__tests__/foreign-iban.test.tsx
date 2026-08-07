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
      await applicationPage.step1.actions.typeIban('FI2112345600000785');
      applicationPage.step1.expectations.inputValueIsSet(
        'bank_account_number',
        'FI21 1234 5600 0007 85'
      );
      await applicationPage.step1.expectations.expectForeignIbanNote(false);

      // Change to foreign IBAN
      await applicationPage.step1.actions.typeIban('DE89370400440532013000');
      applicationPage.step1.expectations.inputValueIsSet(
        'bank_account_number',
        'DE89 3704 0044 0532 0130 00'
      );
      await applicationPage.step1.expectations.expectForeignIbanNote(true);
      applicationPage.step1.expectations.expectForeignIbanFieldsVisible(true);

      // Fill in the foreign payment information
      await applicationPage.step1.actions.typePayeeName('Foreign Payee');
      await applicationPage.step1.actions.typePayeeAddress('Foreign Address');
      await applicationPage.step1.actions.typeBankSwiftBicCode('SWIFT123');
      await applicationPage.step1.actions.typeBankName('Foreign Bank');
      await applicationPage.step1.actions.typeBankAddress('Bank Street 1');

      // Verify they are set in the form
      applicationPage.step1.expectations.inputValueIsSet(
        'payee_name',
        'Foreign Payee'
      );
      applicationPage.step1.expectations.inputValueIsSet(
        'payee_address',
        'Foreign Address'
      );
      applicationPage.step1.expectations.inputValueIsSet(
        'bank_swift_bic_code',
        'SWIFT123'
      );
      applicationPage.step1.expectations.inputValueIsSet(
        'bank_name',
        'Foreign Bank'
      );
      applicationPage.step1.expectations.inputValueIsSet(
        'bank_address',
        'Bank Street 1'
      );

      // Change back to Finnish IBAN
      await applicationPage.step1.actions.typeIban('FI2112345600000785');
      await applicationPage.step1.expectations.expectForeignIbanNote(false);

      // Verify foreign fields are no longer visible
      applicationPage.step1.expectations.expectForeignIbanFieldsVisible(false);

      // Verify no leftover errors for these fields
      applicationPage.step1.expectations.expectNoValidationError('payee_name');
      applicationPage.step1.expectations.expectNoValidationError(
        'payee_address'
      );
      applicationPage.step1.expectations.expectNoValidationError(
        'bank_swift_bic_code'
      );
      applicationPage.step1.expectations.expectNoValidationError('bank_name');
      applicationPage.step1.expectations.expectNoValidationError(
        'bank_address'
      );
    },
    SLOW_JEST_TIMEOUT
  );
});
