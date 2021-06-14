// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type, testing-library/await-async-query, security/detect-non-literal-fs-filename */
import {
  getErrorMessage,
  screenContext,
} from '@frontend/shared/browser-tests/utils/testcafe.utils';
import TestController from 'testcafe';

import Company from '../../src/types/company';

export const getCompanyPageComponents = (t: TestController) => {
  const screen = screenContext(t);

  const companyData = async (company: Company) => {
    const selectors = {
      companyData() {
        return screen.findByRole('heading', {
          name: company.name,
        });
      },
    };
    const expectations = {
      async isPresent() {
        await t
          .expect(selectors.companyData().exists)
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
    companyData,
  };
};
