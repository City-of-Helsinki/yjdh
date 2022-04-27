import {
  clickSelectRadioButton,
  fillInput,
} from '@frontend/shared/browser-tests/utils/input.utils';
import {
  getErrorMessage,
  screenContext,
  withinContext,
} from '@frontend/shared/browser-tests/utils/testcafe.utils';
import { KesaseteliAttachment } from '@frontend/shared/src/types/attachment';
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

export const getStep2Components = async (t: TestController) => {
  const screen = screenContext(t);
  const within = withinContext(t);

  const selector = () =>
    screen.findByRole('header', {
      name: /selvitys työsuhteesta/i,
    });

  const isPresent = async () => {
    await t.expect(selector().exists).ok(await getErrorMessage(t));
  };
  await isPresent();

  const formSelector = () =>
    screen.findByRole('form', {
      name: /selvitys työsuhteesta/i,
    });
  const withinForm = (): ReturnType<typeof within> => within(formSelector());

  const accordionSelector = (isOpen = true, index = 0) =>
    screen.findByTestId(`accordion-${index}-${isOpen ? 'open' : 'closed'}`);
  const withinAccordion = (
    isOpen = true,
    index = 0
  ): ReturnType<typeof within> => within(accordionSelector(isOpen, index));

  // eslint-disable-next-line sonarjs/cognitive-complexity
  const form = () => {
    const selectors = {
      title() {
        return formSelector();
      },
    };
    const expectations = {
      async isPresent() {
        await t.expect(selectors.title().exists).ok(await getErrorMessage(t));
      },
    };
    const actions = {
      async openAllClosedAccordions() {
        /* eslint-disable no-await-in-loop */
        for (;;) {
          const closedAccordion = accordionSelector(false);
          if (await closedAccordion.exists) {
            await t.click(closedAccordion);
          } else {
            break;
          }
        }
        /* eslint-enable no-await-in-loop */
      },
      async removeAllAccordions() {
        if (await formSelector().exists) {
          /* eslint-disable no-await-in-loop */
          for (;;) {
            const removeButtons = within(formSelector()).findAllByRole(
              'button',
              {
                name: /poista tiedot/i,
              }
            );
            if (await removeButtons.exists) {
              await t.click(removeButtons.nth(0));
            } else {
              break;
            }
          }
          /* eslint-enable no-await-in-loop */
        }
      },
    };
    return {
      expectations,
      actions,
    };
  };

  const employmentAccordion = async (employeeIndex = 0) => {
    const withinThisAccordion = () => withinAccordion(true, employeeIndex);

    const selectors = {
      employeeNameInput() {
        return withinThisAccordion().findByRole('textbox', {
          name: /^työntekijän nimi/i,
        });
      },
      ssnInput() {
        return withinThisAccordion().findByRole('textbox', {
          name: /^henkilötunnus/i,
        });
      },
      gradeOrBirthYearRadioInput(
        type: EmploymentExceptionReason = '9th_grader'
      ) {
        return withinThisAccordion().findByRole('radio', {
          name: getSelectionGroupTranslation(
            'summer_voucher_exception_reason',
            type
          ),
        });
      },
      homeCityInput() {
        return withinThisAccordion().findByRole('textbox', {
          name: /^kotipaikka/i,
        });
      },
      postcodeInput() {
        return withinThisAccordion().findByRole('spinbutton', {
          name: /^postinumero/i,
        });
      },
      phoneNumberInput() {
        return withinThisAccordion().findByRole('textbox', {
          name: /^puhelinnumero/i,
        });
      },
      employmentPostcodeInput() {
        return withinThisAccordion().findByRole('spinbutton', {
          name: /^työn suorituspaikan postinumero/i,
        });
      },
      schoolInput() {
        return withinThisAccordion().findByRole('textbox', {
          name: /^koulun nimi/i,
        });
      },
      serialNumberInput() {
        return withinThisAccordion().findByRole('textbox', {
          name: /^kesäsetelin sarjanumero/i,
        });
      },
      employmentContractAttachmentInput: () =>
        withinThisAccordion().findByTestId(
          `summer_vouchers.${employeeIndex}.employment_contract`
        ),
      employmentContractAttachmentButton: () =>
        withinThisAccordion().findByRole('button', {
          name: /^työsopimus/i,
        }),
      attachmentLink: (attachment: KesaseteliAttachment) =>
        withinThisAccordion()
          .findAllByRole('link', {
            name: new RegExp(getAttachmentFileName(attachment), 'i'),
          })
          .nth(0),
      payslipAttachmentInput: () =>
        withinThisAccordion().findByTestId(
          `summer_vouchers.${employeeIndex}.payslip`
        ),
      payslipAttachmentButton: () =>
        withinThisAccordion().findByRole('button', {
          name: /^palkkatodistus/i,
        }),
      startDateInput() {
        return withinThisAccordion().findByRole('textbox', {
          name: /^työsuhteen alkamispäivä/i,
        });
      },
      endDateInput() {
        return withinThisAccordion().findByRole('textbox', {
          name: /^työsuhteen päättymispäivä/i,
        });
      },
      workHoursInput() {
        return withinThisAccordion().findByRole('spinbutton', {
          name: /^tehdyt työtunnit/i,
        });
      },
      descriptionInput() {
        return withinThisAccordion().findByRole('textbox', {
          name: /^kuvaus työtehtävistä/i,
        });
      },
      salaryInput() {
        return withinThisAccordion().findByRole('spinbutton', {
          name: /^maksettu palkka/i,
        });
      },
      hiredWithoutVoucherAssessmentRadioInput(
        type: EmployeeHiredWithoutVoucherAssessment = 'maybe'
      ) {
        return withinThisAccordion().findByRole('radio', {
          name: getSelectionGroupTranslation(
            'hired_without_voucher_assessment',
            type
          ),
        });
      },
      removeAttachmentButtons() {
        return withinThisAccordion().findAllByRole('link', {
          name: /poista tiedosto/i,
        });
      },
      saveButton() {
        return withinThisAccordion().findByRole('button', {
          name: /^tallenna tiedot/i,
        });
      },
    };
    const expectations = {
      async isPresent(isOpen = true) {
        await t.expect(formSelector().exists).ok(await getErrorMessage(t));
        await t
          .expect(accordionSelector(isOpen, employeeIndex).exists)
          .ok(await getErrorMessage(t));
      },
      async isAttachmentUploaded(attachment: KesaseteliAttachment) {
        return t
          .expect(selectors.attachmentLink(attachment).exists)
          .ok(await getErrorMessage(t));
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
        return clickSelectRadioButton(
          t,
          selectors.gradeOrBirthYearRadioInput(type)
        );
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
      async addEmploymentContractAttachment(attachment: KesaseteliAttachment) {
        await t
          .setFilesToUpload(
            selectors.employmentContractAttachmentInput(),
            getAttachmentFilePath(attachment)
          )
          .click(selectors.employmentContractAttachmentButton());
        await expectations.isAttachmentUploaded(attachment);
      },
      async addPayslipAttachments(attachment: KesaseteliAttachment) {
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
        return clickSelectRadioButton(
          t,
          selectors.hiredWithoutVoucherAssessmentRadioInput(type)
        );
      },
      async removeExistingAttachments() {
        /* eslint-disable no-await-in-loop */
        for (;;) {
          const removeAttachmentButtons = selectors.removeAttachmentButtons();

          if (await removeAttachmentButtons.exists) {
            await t.click(removeAttachmentButtons.nth(0));
          } else {
            break;
          }
        }
        /* eslint-enable no-await-in-loop */
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
          .ok(await getErrorMessage(t));
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
    form,
    employmentAccordion,
    addEmploymentButton,
  };
};
