import {
  getErrorMessage,
  screenContext,
} from '@frontend/shared/browser-tests/utils/testcafe.utils';
import Company from '@frontend/shared/src/types/company';
import TestController from 'testcafe';

export const getApplicationPageComponents = (t: TestController) => {
  const screen = screenContext(t);

  const companyTable = async (company: Company) => {
    const selectors = {
      companyTable() {
        return screen.findByRole('heading', {
          name: company.name,
        });
      },
    };
    const expectations = {
      async isPresent() {
        await t
          .expect(selectors.companyTable().exists)
          .ok(await getErrorMessage(t));
      },
      async isCompanyDataPresent() {
        await t
          .expect(screen.findByRole('heading', { name: company.name }).exists)
          .ok(await getErrorMessage(t));
        await t
          .expect(screen.findByText(company.business_id).exists)
          .ok(await getErrorMessage(t));
        await t
          .expect(screen.findByText(company.industry).exists)
          .ok(await getErrorMessage(t));
        await t
          .expect(screen.findByText(company.street_address).exists)
          .ok(await getErrorMessage(t));
        await t
          .expect(screen.findByText(company.postcode).exists)
          .ok(await getErrorMessage(t));
        await t
          .expect(screen.findByText(company.city).exists)
          .ok(await getErrorMessage(t));
      },
    };
    const actions = {};
    await expectations.isPresent();
    return {
      selectors,
      expectations,
      actions,
    };
  };
  return {
    companyTable,
  };
};
