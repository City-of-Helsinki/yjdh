/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import TestController from 'testcafe';

import { getErrorMessage, screenContext } from '../../shared/browser-tests/utils/testcafe.utils';
import Company from '../../employer/src/types/company';

export const getCompanyPageComponents = (t: TestController) => {
  const screen = screenContext(t);

  const companyData = async (company: Company) => {
    await t
      .expect(
        screen.findByRole('heading', { name: company.name }),
      )
      .ok(await getErrorMessage(t));

    const selectors = {};
    const expectations = {
      async isPresent() {
        await t.expect(screen.findByRole('heading', { name: company.name }).exists).ok(await getErrorMessage(t));
        await t.expect(screen.findByText(company.business_id).exists).ok(await getErrorMessage(t));
        await t.expect(screen.findByText(company.industry).exists).ok(await getErrorMessage(t));
        await t.expect(screen.findByText(company.street_address).exists).ok(await getErrorMessage(t));
        await t.expect(screen.findByText(company.postcode).exists).ok(await getErrorMessage(t));
        await t.expect(screen.findByText(company.city).exists).ok(await getErrorMessage(t));
      },
    };
    const actions = {};
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
