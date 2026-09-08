import isRealIntegrationsEnabled from '@frontend/kesaseteli-shared/src/flags/is-real-integrations-enabled';
import Application from '@frontend/kesaseteli-shared/src/types/application';
import Company from '@frontend/kesaseteli-shared/src/types/company';
import ContactInfo from '@frontend/kesaseteli-shared/src/types/contact-info';
import Employment from '@frontend/kesaseteli-shared/src/types/employment';
import {
  getErrorMessage,
  screenContext,
  withinContext,
} from '@frontend/shared/browser-tests/utils/testcafe.utils';
import { convertToUIDateFormat } from '@frontend/shared/src/utils/date.utils';
import { electronicFormatIBAN, friendlyFormatIBAN } from 'ibantools';

import { getSelectionGroupTranslation } from '../utils/application.utils';

const JOB_TYPE_LABELS: Record<string, string> = {
  sports_and_leisure: 'Liikunta ja vapaa-aika',
  administration: 'Hallinto- ja toimistotyö',
  sales: 'Myynti- ja kaupan ala',
};

const getAttachmentNames = (
  field: 'employment_contract' | 'payslip'
): string[] =>
  field === 'employment_contract'
    ? ['sample1', 'sample2', 'sample3', 'sample4', 'sample5']
    : ['sample6', 'sample7'];

export const getSummaryComponents = async (t: TestController) => {
  const screen = screenContext(t);
  const within = withinContext(t);

  const employerSectionSelector = (): Selector =>
    screen.findByTestId('employer-section');
  const findEmployerField = (id: string) =>
    within(employerSectionSelector()).findByTestId(id);
  const employmentSectionSelector = (): Selector =>
    screen.findByTestId('employment-section');
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
      employerField(field: keyof Company | keyof ContactInfo) {
        return findEmployerField(`${String(field)}`);
      },
    };
    const expectations = {
      async isPresent() {
        return t
          .expect(selectors.section().exists)
          .ok(await getErrorMessage(t));
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
          field: keyof ContactInfo,
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
        await expectFieldHasValue(
          'bank_account_number',
          friendlyFormatIBAN(application.bank_account_number) ?? ''
        );
        if (
          application.bank_account_number &&
          !electronicFormatIBAN(application.bank_account_number)?.startsWith(
            'FI'
          )
        ) {
          await expectFieldHasValue('payee_name');
          await expectFieldHasValue('payee_address');
          await expectFieldHasValue('bank_swift_bic_code');
          await expectFieldHasValue('bank_name');
          await expectFieldHasValue('bank_address');
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
          .ok(await getErrorMessage(t));
      },
      async isFulFilledWith(employment: Employment) {
        const {
          employee_name,
          employee_birthdate,
          employment_start_date,
          employment_end_date,
          employment_description,
          job_type,
        } = employment;

        const expectEmploymentFieldhasValue = async (
          field: keyof Employment,
          value?: string | number
        ) =>
          expectElementHasValue(
            selectors.employmentField(field),
            value ?? String(employment[field])
          );

        const expectTargetGroupHasValue = async (
          field: 'hired_without_voucher_assessment' | 'job_type'
        ) => {
          const value = employment[field];
          if (!value) {
            throw new Error(`selection value is missing for ${field}`);
          }
          await expectEmploymentFieldhasValue(
            field,
            getSelectionGroupTranslation(field, value)
          );
        };

        const expectAttachments = (field: 'employment_contract' | 'payslip') =>
          Promise.all(
            getAttachmentNames(field).map((attachment) =>
              expectEmploymentFieldhasValue(field, attachment)
            )
          );

        const header = selectors.employmentHeading();
        await t
          .expect(header.textContent)
          .contains(employee_name ?? '', await getErrorMessage(t));
        await expectEmploymentFieldhasValue(
          'employee_birthdate',
          convertToUIDateFormat(employee_birthdate)
        );
        await expectEmploymentFieldhasValue('employee_phone_number');
        await expectEmploymentFieldhasValue('employment_postcode');
        await expectAttachments('employment_contract');
        await expectAttachments('payslip');
        const dateRange = [employment_start_date, employment_end_date]
          .map((date) => convertToUIDateFormat(date))
          .join(' - ');
        await expectEmploymentFieldhasValue('employment_start_date', dateRange);
        await expectEmploymentFieldhasValue('employment_work_hours');
        await expectEmploymentFieldhasValue('employment_salary_paid');
        if (employment_description) {
          await expectEmploymentFieldhasValue('employment_description');
        }
        if (job_type) {
          await expectEmploymentFieldhasValue(
            'job_type',
            JOB_TYPE_LABELS[job_type] ?? job_type
          );
        }
        await expectTargetGroupHasValue('hired_without_voucher_assessment');
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
