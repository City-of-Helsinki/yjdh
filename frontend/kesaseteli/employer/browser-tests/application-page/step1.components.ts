import { fillInput } from '@frontend/shared/browser-tests/utils/input.utils';
import {
  getErrorMessage,
  screenContext,
  withinContext,
} from '@frontend/shared/browser-tests/utils/testcafe.utils';
import Company from '@frontend/shared/src/types/company';
import ContactInfo from '@frontend/shared/src/types/contact-info';
import { friendlyFormatIBAN } from 'ibantools';
import TestController, { Selector } from 'testcafe';

const formSelector = () => Selector('form#employer-application-form');

export const getStep1Components = (t: TestController) => {
  const screen = screenContext(t);
  const within = withinContext(t);
  const companyTable = async (company: Company) => {
    const selectors = {
      companyTable() {
        return screen.findAllByRole('region', { name: /yrityksen tiedot/i });
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
          .expect(screen.findByLabelText('Yritys').textContent)
          .eql(company.name, await getErrorMessage(t));
        await t
          .expect(screen.findByLabelText(/y-tunnus/i).textContent)
          .eql(company.business_id, await getErrorMessage(t));
        if (company.industry?.length > 0) {
          await t
            .expect(screen.findByLabelText(/toimiala/i).textContent)
            .eql(company.industry, await getErrorMessage(t));
        }
        if (company.street_address?.length > 0) {
          await t
            .expect(screen.findByLabelText(/yritysmuoto/i).textContent)
            .eql(company.street_address, await getErrorMessage(t));
        }
        if (company.postcode?.length > 0) {
          await t
            .expect(screen.findByLabelText(/postiosoite/i).textContent)
            .eql(company.postcode, await getErrorMessage(t));
        }
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

  const withinForm = (): ReturnType<typeof within> => within(formSelector());

  const getFormSelectors = () => ({
    contactPersonNameInput() {
      return withinForm().findByRole('textbox', {
        name: /^yhteyshenkilön nimi/i,
      });
    },
    contactPersonEmailInput() {
      return withinForm().findByRole('textbox', {
        name: /^yhteyshenkilön sähköposti/i,
      });
    },
    contactPersonPhoneInput() {
      return withinForm().findByRole('textbox', {
        name: /^yhteyshenkilön puhelinnumero/i,
      });
    },
    streetAddessInput() {
      return withinForm().findByRole('textbox', {
        name: /^työpaikan lähiosoite/i,
      });
    },
    bankAccountNumberInput() {
      return withinForm().findByRole('textbox', {
        name: /^tilinumero/i,
      });
    },
    employeeNameInput() {
      return withinForm().findByRole('textbox', {
        name: /^työntekijän nimi/i,
      });
    },
    serialNumberInput() {
      return withinForm().findByRole('textbox', {
        name: /^kesäsetelin sarjanumero/i,
      });
    },
    fetchEmployeeDataButton() {
      return withinForm().findByRole('button', {
        name: /hae tiedot työntekijän nimen ja kesäsetelin sarjanumeron avulla/i,
      });
    },
    ssnInput() {
      return withinForm().findByRole('textbox', {
        name: /^henkilötunnus/i,
      });
    },
    targetGroupInput(value: string) {
      // Target the label instead of the input to avoid overlap issues
      return Selector(`label[for="summer_vouchers.0.target_group-${value}"]`);
    },
    homeCityInput() {
      return withinForm().findByRole('textbox', {
        name: /^kotipaikka/i,
      });
    },
    postcodeInput() {
      return withinForm().findByRole('spinbutton', {
        name: /^postinumero/i,
      });
    },
    phoneNumberInput() {
      return withinForm().findByRole('textbox', {
        name: /^puhelinnumero/i,
      });
    },
    employmentPostcodeInput() {
      return withinForm().findByRole('spinbutton', {
        name: /^työn suorituspaikan postinumero/i,
      });
    },
    schoolInput() {
      return withinForm().findByRole('textbox', {
        name: /^koulun nimi/i,
      });
    },
    employmentContractAttachmentInput: () =>
      withinForm().findByTestId('summer_vouchers.0.employment_contract'),
    payslipAttachmentInput: () =>
      withinForm().findByTestId('summer_vouchers.0.payslip'),
    startDateInput() {
      return withinForm().findByRole('textbox', {
        name: /^työsuhteen alkamispäivä/i,
      });
    },
    endDateInput() {
      return withinForm().findByRole('textbox', {
        name: /^työsuhteen päättymispäivä/i,
      });
    },
    workHoursInput() {
      return withinForm().findByRole('spinbutton', {
        name: /^tehdyt työtunnit/i,
      });
    },
    descriptionInput() {
      return withinForm().findByRole('textbox', {
        name: /^kuvaus työtehtävistä/i,
      });
    },
    salaryInput() {
      return withinForm().findByRole('spinbutton', {
        name: /^maksettu palkka/i,
      });
    },
    hiredWithoutVoucherAssessmentRadioInput(value: string) {
      // Target the label instead of the input to avoid overlap issues
      return Selector(
        `label[for="summer_vouchers.0.hired_without_voucher_assessment-${value}"]`
      );
    },
    removeExistingAttachmentsButton() {
      return withinForm().findAllByRole('button', {
        name: /poista tiedosto/i,
      });
    },
  });

  const selectors = getFormSelectors();

  const expectations = {
    async isPresent() {
      await t.expect(formSelector().exists).ok(await getErrorMessage(t));
    },
    async isEmploymentFieldsEnabled() {
      await t
        .expect(selectors.ssnInput().hasAttribute('disabled'))
        .notOk(await getErrorMessage(t));
      // Wait for at least one target group to appear to ensure dynamic content is loaded
      await t
        .expect(Selector('[data-testid*="target_group-"]').exists)
        .ok('Target groups did not load in time', { timeout: 10_000 });
    },
    async isSsnFieldReadOnly() {
      await t
        .expect(selectors.ssnInput().hasAttribute('readonly'))
        .ok(await getErrorMessage(t));
    },
    async isFulFilledWith({
      contact_person_name,
      contact_person_email,
      contact_person_phone_number,
      bank_account_number,
      street_address,
    }: ContactInfo) {
      await t.expect(formSelector().exists).ok(await getErrorMessage(t));
      await t
        .expect(selectors.contactPersonNameInput().value)
        .eql(contact_person_name, await getErrorMessage(t));
      await t
        .expect(selectors.contactPersonEmailInput().value)
        .eql(contact_person_email, await getErrorMessage(t));
      await t
        .expect(selectors.streetAddessInput().value)
        .eql(street_address, await getErrorMessage(t));
      await t
        .expect(selectors.bankAccountNumberInput().value)
        .eql(
          friendlyFormatIBAN(bank_account_number) ?? '',
          await getErrorMessage(t)
        );
      await t
        .expect(selectors.contactPersonPhoneInput().value)
        .eql(contact_person_phone_number, await getErrorMessage(t));
    },
    async isEmploymentFulfilledWith({
      employee_ssn,
      employee_phone_number,
      employee_postcode,
      employee_school,
    }: {
      employee_ssn?: string;
      employee_phone_number?: string;
      employee_postcode?: string | number;
      employee_school?: string;
    }) {
      await t.expect(formSelector().exists).ok(await getErrorMessage(t));
      if (employee_ssn) {
        await t
          .expect(selectors.ssnInput().value)
          .eql(employee_ssn, await getErrorMessage(t));
      }
      if (employee_phone_number) {
        await t
          .expect(selectors.phoneNumberInput().value)
          .eql(employee_phone_number, await getErrorMessage(t));
      }
      if (employee_postcode) {
        await t
          .expect(selectors.postcodeInput().value)
          .eql(String(employee_postcode), await getErrorMessage(t));
      }
      if (employee_school) {
        await t
          .expect(selectors.schoolInput().value)
          .eql(employee_school, await getErrorMessage(t));
      }
    },
    async isEmploymentSupplementFulfilledWith({
      target_group,
      employment_start_date,
      employment_end_date,
      hired_without_voucher_assessment,
    }: {
      target_group?: string;
      employment_start_date?: string;
      employment_end_date?: string;
      hired_without_voucher_assessment?: string;
    }) {
      if (target_group) {
        await t
          .expect(
            Selector(`input#summer_vouchers\\.0\\.target_group-${target_group}`)
              .checked
          )
          .ok(await getErrorMessage(t));
      }
      if (employment_start_date) {
        await t
          .expect(selectors.startDateInput().value)
          .eql(employment_start_date, await getErrorMessage(t));
      }
      if (employment_end_date) {
        await t
          .expect(selectors.endDateInput().value)
          .eql(employment_end_date, await getErrorMessage(t));
      }
      if (hired_without_voucher_assessment) {
        await t
          .expect(
            Selector(
              `input#summer_vouchers\\.0\\.hired_without_voucher_assessment-${hired_without_voucher_assessment}`
            ).checked
          )
          .ok(await getErrorMessage(t));
      }
    },
  };

  const addEmploymentContractAttachment = async (attachments: string[]) => {
    /* eslint-disable no-restricted-syntax, no-await-in-loop */
    for (const attachment of attachments) {
      await t.setFilesToUpload(
        selectors.employmentContractAttachmentInput(),
        attachment
      );
    }
    /* eslint-enable no-restricted-syntax, no-await-in-loop */
  };

  const addPayslipAttachments = async (attachments: string[]) => {
    /* eslint-disable no-restricted-syntax, no-await-in-loop */
    for (const attachment of attachments) {
      await t.setFilesToUpload(selectors.payslipAttachmentInput(), attachment);
    }
    /* eslint-enable no-restricted-syntax, no-await-in-loop */
  };

  const actions = {
    fillContactPersonName(name: string) {
      return fillInput(
        t,
        'contact_person_name',
        selectors.contactPersonNameInput(),
        name
      );
    },
    fillContactPersonEmail(email: string) {
      return fillInput(
        t,
        'contact_person_email',
        selectors.contactPersonEmailInput(),
        email
      );
    },
    fillContactPersonPhone(phone: string) {
      return fillInput(
        t,
        'contact_person_phone_number',
        selectors.contactPersonPhoneInput(),
        phone
      );
    },
    fillStreetAddress(address: string) {
      return fillInput(
        t,
        'street_address',
        selectors.streetAddessInput(),
        address
      );
    },
    fillBankAccountNumber(bankAccountNumber: string) {
      return fillInput(
        t,
        'bank_account_number',
        selectors.bankAccountNumberInput(),
        bankAccountNumber
      );
    },
    fillEmployeeName(name: string) {
      return fillInput(
        t,
        'summer_vouchers.0.employee_name',
        selectors.employeeNameInput(),
        name
      );
    },
    fillSerialNumber(serialNumber: string) {
      return fillInput(
        t,
        'summer_vouchers.0.summer_voucher_serial_number',
        selectors.serialNumberInput(),
        serialNumber
      );
    },
    async clickFetchEmployeeDataButton() {
      await t.click(selectors.fetchEmployeeDataButton());
    },
    fillSsn(ssn: string) {
      return fillInput(
        t,
        'summer_vouchers.0.employee_ssn',
        selectors.ssnInput(),
        ssn
      );
    },
    async selectTargetGroup(name: string) {
      const selector = selectors.targetGroupInput(name);
      await t
        .expect(selector.exists)
        .ok(await getErrorMessage(t), { timeout: 10_000 });
      await t.click(selector);
    },
    fillHomeCity(city: string) {
      return fillInput(
        t,
        'summer_vouchers.0.employee_home_city',
        selectors.homeCityInput(),
        city
      );
    },
    fillPostcode(postcode: string) {
      return fillInput(
        t,
        'summer_vouchers.0.employee_postcode',
        selectors.postcodeInput(),
        postcode
      );
    },
    fillPhoneNumber(phone: string) {
      return fillInput(
        t,
        'summer_vouchers.0.employee_phone_number',
        selectors.phoneNumberInput(),
        phone
      );
    },
    fillEmploymentPostcode(postcode: string) {
      return fillInput(
        t,
        'summer_vouchers.0.employment_postcode',
        selectors.employmentPostcodeInput(),
        postcode
      );
    },
    fillSchool(school: string) {
      return fillInput(
        t,
        'summer_vouchers.0.employee_school',
        selectors.schoolInput(),
        school
      );
    },
    addEmploymentContractAttachment,
    addPayslipAttachments,
    fillStartDate(date: string) {
      return fillInput(
        t,
        'summer_vouchers.0.employment_start_date',
        selectors.startDateInput(),
        date
      );
    },
    fillEndDate(date: string) {
      return fillInput(
        t,
        'summer_vouchers.0.employment_end_date',
        selectors.endDateInput(),
        date
      );
    },
    fillWorkHours(hours: string) {
      return fillInput(
        t,
        'summer_vouchers.0.employment_work_hours',
        selectors.workHoursInput(),
        hours
      );
    },
    fillDescription(description: string) {
      return fillInput(
        t,
        'summer_vouchers.0.employment_description',
        selectors.descriptionInput(),
        description
      );
    },
    fillSalary(salary: string) {
      return fillInput(
        t,
        'summer_vouchers.0.employment_salary_paid',
        selectors.salaryInput(),
        salary
      );
    },
    async selectHiredWithoutVoucherAssessment(name: string) {
      const selector = selectors.hiredWithoutVoucherAssessmentRadioInput(name);
      await t
        .expect(selector.exists)
        .ok(await getErrorMessage(t), { timeout: 10_000 });
      await t.click(selector);
    },
    async uploadFiles(
      employmentContractAttachments: string[],
      payslipAttachments: string[]
    ) {
      await addEmploymentContractAttachment(employmentContractAttachments);
      await addPayslipAttachments(payslipAttachments);
    },
    async removeExistingAttachments() {
      const buttons = selectors.removeExistingAttachmentsButton();
      const count = await buttons.count;
      /* eslint-disable no-restricted-syntax, no-await-in-loop */
      for (let i = 0; i < count; i += 1) {
        await t.click(buttons.nth(0));
      }
      /* eslint-enable no-restricted-syntax, no-await-in-loop */
    },
  };

  const form = async () => {
    await expectations.isPresent();
    return {
      selectors,
      expectations,
      actions,
    };
  };
  return {
    companyTable,
    form,
  };
};
