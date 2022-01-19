import {
  getErrorMessage,
  screenContext,
  withinContext,
} from '@frontend/shared/browser-tests/utils/testcafe.utils';
import isRealIntegrationsEnabled from '@frontend/shared/src/flags/is-real-integrations-enabled';
import Application from '@frontend/shared/src/types/application';
import Company from '@frontend/shared/src/types/company';
import ContactPerson from '@frontend/shared/src/types/contact_person';
import Employment from '@frontend/shared/src/types/employment';
import Invoicer from '@frontend/shared/src/types/invoicer';
import { convertToUIDateFormat } from '@frontend/shared/src/utils/date.utils';
import TestController from 'testcafe';

import {
  getAttachmentFileName,
  getSelectionGroupTranslation,
} from '../utils/application.utils';

export const getSummaryComponents = async (t: TestController) => {
  const screen = screenContext(t);
  const within = withinContext(t);

  const employerSectionSelector = (): Selector =>
    screen.findByRole('region', { name: /^työnantajan tiedot/i });
  const findEmployerField = (id: string) =>
    within(employerSectionSelector()).findByTestId(id);
  const employmentSectionSelector = (): Selector =>
    screen.findByRole('region', { name: /^selvitys työsuhteesta/i });
  const findEmploymentField = (id: string) =>
    within(employmentSectionSelector()).findByTestId(id);

  const expectElementHasValue = async (
    selector: Selector | SelectorPromise,
    value?: string | number
  ) => {
    if (!value) {
      throw new Error('value is missing');
    }
    await t
      .expect(selector.textContent)
      .contains(String(value), await getErrorMessage(t));
  };

  const employerSection = async () => {
    const selectors = {
      section() {
        return employerSectionSelector();
      },
      companyHeading() {
        return findEmployerField('company-heading');
      },
      employerField(
        field: keyof Company | keyof ContactPerson | keyof Invoicer
      ) {
        return findEmployerField(`${String(field)}`);
      },
    };
    const expectations = {
      async isPresent() {
        return t
          .expect(selectors.section().exists)
          .ok(await getErrorMessage(t), { timeout: 10_000 });
      },
      async isCompanyDataPresent(company: Company) {
        const expectCompanyFieldHasValue = async (
          field: keyof Company,
          value?: string | number
        ) =>
          expectElementHasValue(
            selectors.employerField(field),
            value || String(company[field]) || '-'
          );
        const header = selectors.companyHeading();
        await expectElementHasValue(header, company.name);
        await expectElementHasValue(header, company.business_id);
        await expectCompanyFieldHasValue('industry');
        await expectCompanyFieldHasValue('company_form');
        await expectCompanyFieldHasValue('postcode');
        await expectCompanyFieldHasValue('city');
      },
      async isFulFilledWith(application: Application) {
        const expectFieldHasValue = async (
          field: keyof ContactPerson | keyof Invoicer,
          value?: string | number
        ) =>
          expectElementHasValue(
            selectors.employerField(field),
            value ?? String(application[field])
          );

        await expectFieldHasValue('contact_person_name');
        await expectFieldHasValue('contact_person_email');
        await expectFieldHasValue('contact_person_phone_number');
        await expectFieldHasValue('street_address');
        if (application.is_separate_invoicer) {
          await expectFieldHasValue('invoicer_name');
          await expectFieldHasValue('invoicer_email');
          await expectFieldHasValue('invoicer_phone_number');
        }
      },
    };
    await expectations.isPresent();
    return {
      selectors,
      expectations,
    };
  };

  const employmentSection = async (employmentIndex = 0) => {
    const selectors = {
      employmentHeading() {
        return findEmploymentField(`employee-heading-${employmentIndex}`);
      },
      employmentField(field: keyof Employment) {
        return findEmploymentField(`${field}-${employmentIndex}`);
      },
    };

    const expectations = {
      async isPresent() {
        return t
          .expect(selectors.employmentHeading().exists)
          .ok(await getErrorMessage(t), { timeout: 10_000 });
      },
      async isFulFilledWith(employment: Employment) {
        const expectEmploymentFieldhasValue = async (
          field: keyof Employment,
          value?: string | number
        ) =>
          expectElementHasValue(
            selectors.employmentField(field),
            value ?? String(employment[field])
          );

        const expectEmploymentSelectionHasValue = (
          field:
            | 'summer_voucher_exception_reason'
            | 'hired_without_voucher_assessment'
        ) => {
          const value = employment[field];
          if (!value) {
            throw new Error(`selection value is missing for ${field}`);
          }
          return expectEmploymentFieldhasValue(
            field,
            getSelectionGroupTranslation(field, value)
          );
        };

        const expectAttachments = (
          field: 'employment_contract' | 'payslip'
        ) => {
          const attachments = employment[field];
          return Promise.all(
            attachments.map((attachment) =>
              expectEmploymentFieldhasValue(
                field,
                getAttachmentFileName(attachment)
              )
            )
          );
        };

        const header = selectors.employmentHeading();
        await expectElementHasValue(header, employment.employee_name);
        await expectElementHasValue(header, employment.employee_ssn);
        await expectEmploymentSelectionHasValue(
          'summer_voucher_exception_reason'
        );
        await expectEmploymentFieldhasValue('employee_postcode');
        await expectEmploymentFieldhasValue('employee_home_city');
        await expectEmploymentFieldhasValue('employee_phone_number');
        await expectEmploymentFieldhasValue('employment_postcode');
        await expectEmploymentFieldhasValue('employee_school');
        await expectAttachments('employment_contract');
        await expectAttachments('payslip');
        await expectEmploymentFieldhasValue('employee_school');
        const { employment_start_date, employment_end_date } = employment;
        const dateRange = [employment_start_date, employment_end_date]
          .map((date) => convertToUIDateFormat(date))
          .join(' - ');
        await expectEmploymentFieldhasValue('employment_start_date', dateRange);
        await expectEmploymentFieldhasValue('employment_work_hours');
        await expectEmploymentFieldhasValue('employment_salary_paid');
        await expectEmploymentFieldhasValue('employment_description');
        await expectEmploymentSelectionHasValue(
          'hired_without_voucher_assessment'
        );
      },
    };
    await expectations.isPresent();
    return {
      selectors,
      expectations,
    };
  };

  const expectations = {
    async isCompanyDataPresent(company?: Company) {
      if (company && isRealIntegrationsEnabled()) {
        const employerSummaryComponent = await employerSection();
        await employerSummaryComponent.expectations.isCompanyDataPresent(
          company
        );
      }
    },
    async isFulFilledWith(application: Application) {
      const employerSummaryComponent = await employerSection();
      await employerSummaryComponent.expectations.isFulFilledWith(application);
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < application.summer_vouchers.length; i++) {
        const employment = application.summer_vouchers[i];
        // eslint-disable-next-line no-await-in-loop
        const employmentSummaryComponent = await employmentSection(i);
        // eslint-disable-next-line no-await-in-loop
        await employmentSummaryComponent.expectations.isFulFilledWith(
          employment
        );
      }
    },
  };
  await employerSection();
  return { expectations };
};
