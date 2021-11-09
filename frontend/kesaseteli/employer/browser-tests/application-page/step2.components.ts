import {
  getErrorMessage,
  screenContext,
  withinContext,
} from '@frontend/shared/browser-tests/utils/testcafe.utils';
import Attachment from '@frontend/shared/src/types/attachment';
import {
  EmployeeHiredWithoutVoucherAssessment,
  EmploymentExceptionReason,
} from '@frontend/shared/src/types/employment';
import TestController from 'testcafe';

import {
  getAttachmentFileName,
  getAttachmentFilePath,
  getSelectionGroupTranslation,
} from '../utils/application.utils';
import { fillInput } from '../utils/input.utils';

export const getStep2Components = (t: TestController) => {
  const screen = screenContext(t);
  const within = withinContext(t);

  const formSelector = () =>
    screen.findByRole('form', {
      name: /selvitys työsuhteesta/i,
    });
  const withinForm = (): ReturnType<typeof within> => within(formSelector());

  const employmentAccordion = async (employeeIndex = 0) => {
    const accordionSelector = (isOpen = true) =>
      withinForm().findByTestId(
        `accordion-${employeeIndex}-${isOpen ? 'open' : 'closed'}`
      );
    const withinAccordion = (isOpen = true): ReturnType<typeof within> =>
      within(accordionSelector(isOpen));

    const selectors = {
      employeeNameInput() {
        return withinAccordion().findByRole('textbox', {
          name: /^työntekijän nimi/i,
        });
      },
      ssnInput() {
        return withinAccordion().findByRole('textbox', {
          name: /^henkilötunnus/i,
        });
      },
      gradeOrBirthYearRadioInput(
        type: EmploymentExceptionReason = '9th_grader'
      ) {
        return withinAccordion().findByRole('radio', {
          name: getSelectionGroupTranslation(
            'summer_voucher_exception_reason',
            type
          ),
        });
      },
      homeCityInput() {
        return withinAccordion().findByRole('textbox', {
          name: /^kotipaikka/i,
        });
      },
      postcodeInput() {
        return withinAccordion().findByRole('spinbutton', {
          name: /^postinumero/i,
        });
      },
      phoneNumberInput() {
        return withinAccordion().findByRole('textbox', {
          name: /^puhelinnumero/i,
        });
      },
      employmentPostcodeInput() {
        return withinAccordion().findByRole('spinbutton', {
          name: /^työn suorituspaikan postinumero/i,
        });
      },
      schoolInput() {
        return withinAccordion().findByRole('textbox', {
          name: /^koulun nimi/i,
        });
      },
      serialNumberInput() {
        return withinAccordion().findByRole('textbox', {
          name: /^kesäsetelin sarjanumero/i,
        });
      },
      employmentContractAttachmentInput: () =>
        withinAccordion().findByTestId(
          `summer_vouchers.${employeeIndex}.employment_contract`
        ),
      employmentContractAttachmentButton: () =>
        withinAccordion().findByRole('button', {
          name: /^työsopimus/i,
        }),
      attachmentLink: (attachment: Attachment) =>
        withinAccordion()
          .findAllByRole('link', {
            name: new RegExp(getAttachmentFileName(attachment), 'i'),
          })
          .nth(0),
      payslipAttachmentInput: () =>
        withinAccordion().findByTestId(
          `summer_vouchers.${employeeIndex}.payslip`
        ),
      payslipAttachmentButton: () =>
        withinAccordion().findByRole('button', {
          name: /^palkkatodistus/i,
        }),
      startDateInput() {
        return withinAccordion().findByRole('textbox', {
          name: /^työsuhteen alkamispäivä/i,
        });
      },
      endDateInput() {
        return withinAccordion().findByRole('textbox', {
          name: /^työsuhteen päättymispäivä/i,
        });
      },
      workHoursInput() {
        return withinAccordion().findByRole('spinbutton', {
          name: /^tehdyt työtunnit/i,
        });
      },
      descriptionInput() {
        return withinAccordion().findByRole('textbox', {
          name: /^kuvaus työtehtävistä/i,
        });
      },
      salaryInput() {
        return withinAccordion().findByRole('spinbutton', {
          name: /^maksettu palkka/i,
        });
      },
      hiredWithoutVoucherAssessmentRadioInput(
        type: EmployeeHiredWithoutVoucherAssessment = 'maybe'
      ) {
        return withinAccordion().findByRole('radio', {
          name: getSelectionGroupTranslation(
            'hired_without_voucher_assessment',
            type
          ),
        });
      },
      saveButton() {
        return withinAccordion().findByRole('button', {
          name: /^tallenna tiedot/i,
        });
      },
    };
    const expectations = {
      async isPresent(isOpen = true) {
        return t
          .expect(accordionSelector(isOpen).exists)
          .ok(await getErrorMessage(t), { timeout: 10000 });
      },
      async isAttachmentUploaded(attachment: Attachment) {
        return t
          .expect(selectors.attachmentLink(attachment).exists)
          .ok(await getErrorMessage(t), { timeout: 10000 });
      },
    };

    const actions = {
      fillEmployeeName(name?: string) {
        return fillInput(
          t,
          'employee_name',
          selectors.employeeNameInput(),
          name
        );
      },
      fillSsn(ssn?: string) {
        return fillInput(t, 'employee_ssn', selectors.ssnInput(), ssn);
      },
      selectGradeOrBirthYear(type?: EmploymentExceptionReason) {
        return t.click(selectors.gradeOrBirthYearRadioInput(type));
      },
      fillHomeCity(city?: string) {
        return fillInput(
          t,
          'employee_home_city',
          selectors.homeCityInput(),
          city
        );
      },
      fillPostcode(postcode?: number) {
        return fillInput(
          t,
          'employee_postcode',
          selectors.postcodeInput(),
          String(postcode ?? '').padStart(5, '0')
        );
      },
      fillPhoneNumber(phoneNumber?: string) {
        return fillInput(
          t,
          'employee_phone_number',
          selectors.phoneNumberInput(),
          phoneNumber
        );
      },
      fillEmploymentPostcode(postcode?: number) {
        return fillInput(
          t,
          'employment_postcode',
          selectors.employmentPostcodeInput(),
          String(postcode ?? '').padStart(5, '0')
        );
      },
      fillSchool(school?: string) {
        return fillInput(t, 'employee_school', selectors.schoolInput(), school);
      },
      fillSerialNumber(serialNumber?: string) {
        return fillInput(
          t,
          'summer_voucher_serial_number',
          selectors.serialNumberInput(),
          serialNumber
        );
      },
      async addEmploymentContractAttachment(attachment: Attachment) {
        await t
          .setFilesToUpload(
            selectors.employmentContractAttachmentInput(),
            getAttachmentFilePath(attachment)
          )
          .click(selectors.employmentContractAttachmentButton());
        await expectations.isAttachmentUploaded(attachment);
      },
      async addPayslipAttachments(attachment: Attachment) {
        await t
          .setFilesToUpload(
            selectors.payslipAttachmentInput(),
            getAttachmentFilePath(attachment)
          )
          .click(selectors.payslipAttachmentButton());
        await expectations.isAttachmentUploaded(attachment);
      },
      fillStartDate(dateAsString?: string) {
        return fillInput(
          t,
          'employment_start_date',
          selectors.startDateInput(),
          dateAsString
        );
      },
      fillEndDate(dateAsString?: string) {
        return fillInput(
          t,
          'employment_end_date',
          selectors.endDateInput(),
          dateAsString
        );
      },
      fillWorkHours(hours?: number) {
        return fillInput(
          t,
          'employment_work_hours',
          selectors.workHoursInput(),
          String(hours ?? '')
        );
      },
      fillDescription(description?: string) {
        return fillInput(
          t,
          'employment_description',
          selectors.descriptionInput(),
          description
        );
      },
      fillSalary(salary?: number) {
        return fillInput(
          t,
          'employment_salary_paid',
          selectors.salaryInput(),
          String(salary ?? '')
        );
      },
      async selectHiredWithoutVoucherAssessment(
        type?: EmployeeHiredWithoutVoucherAssessment
      ) {
        return t.click(selectors.hiredWithoutVoucherAssessmentRadioInput(type));
      },
      async clickSaveEmployeeButton() {
        return t.click(selectors.saveButton());
      },
    };
    await expectations.isPresent();
    return {
      selectors,
      expectations,
      actions,
    };
  };
  const addEmploymentButton = async () => {
    const selectors = {
      addButton() {
        return withinForm().findByRole('button', {
          name: /^lisää uusi työsuhde/i,
        });
      },
    };
    const expectations = {
      async isPresent() {
        return t
          .expect(selectors.addButton().exists)
          .ok(await getErrorMessage(t), { timeout: 10000 });
      },
    };
    const actions = {
      async click() {
        return t.click(selectors.addButton());
      },
    };
    await expectations.isPresent();
    return {
      selectors,
      expectations,
      actions,
    };
  };

  return {
    employmentAccordion,
    addEmploymentButton,
  };
};
