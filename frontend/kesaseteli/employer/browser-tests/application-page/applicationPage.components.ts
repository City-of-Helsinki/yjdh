import {
  getErrorMessage,
  screenContext,
  setDataToPrintOnFailure,
  withinContext,
} from '@frontend/shared/browser-tests/utils/testcafe.utils';
import Attachment from '@frontend/shared/src/types/attachment';
import Company from '@frontend/shared/src/types/company';
import ContactPerson from '@frontend/shared/src/types/contact_person';
import { getLastValue } from '@frontend/shared/src/utils/array.utils';
import TestController from 'testcafe';

const getAttachmentFilePath = (attachment: Attachment): string =>
  attachment.attachment_file_name ?? attachment.attachmentFileName;

const getAttachmentFileName = (attachment: Attachment): string => {
  const filePath = getAttachmentFilePath(attachment);
  const filename = getLastValue(filePath.split('/')) ?? filePath;
  return filename.replace(`.${getLastValue(filename.split('.')) ?? ''}`, '');
};

export const getApplicationPageComponents = (t: TestController) => {
  const screen = screenContext(t);
  const within = withinContext(t);
  const companyTable = async (company: Company) => {
    const selectors = {
      companyTable() {
        return screen.findAllByRole('grid', { name: /yrityksen tiedot/i });
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
  const commonSelectors = {
    saveAndContinueButton: () =>
      screen.findByRole('button', {
        name: /tallenna ja jatka/i,
      }),
    previousStepButton: () =>
      screen.findByRole('button', {
        name: /palaa edelliseen/i,
      }),
    step1Form: () =>
      screen.findByRole('form', {
        name: /työnantajan tiedot/i,
      }),
    step2Form: (employeeIndex: number) =>
      screen
        .findAllByRole('form', {
          name: /selvitys työsuhteesta/i,
        })
        .nth(employeeIndex),
  };
  const step1 = async () => {
    const withinForm = (): ReturnType<typeof within> =>
      within(commonSelectors.step1Form());

    const selectors = {
      contactPersonNameInput() {
        return withinForm().findByRole('textbox', {
          name: /yhteyshenkilön nimi/i,
        });
      },
      contactPersonEmailInput() {
        return withinForm().findByRole('textbox', {
          name: /yhteyshenkilön sähköposti/i,
        });
      },
      streetAddessInput() {
        return withinForm().findByRole('textbox', {
          name: /työpaikan lähiosoite/i,
        });
      },
      contactPersonPhoneInput() {
        return withinForm().findByRole('textbox', {
          name: /yhteyshenkilön puhelinnumero/i,
        });
      },
      saveAndContinueButton: commonSelectors.saveAndContinueButton,
      previousStepButton: commonSelectors.previousStepButton,
    };
    const expectations = {
      async isPresent() {
        await t
          .expect(commonSelectors.step1Form().exists)
          .ok(await getErrorMessage(t), { timeout: 10000 });
      },
      async isFulFilledWith({
        contact_person_name,
        contact_person_email,
        contact_person_phone_number,
        street_address,
      }: ContactPerson) {
        await t
          .expect(commonSelectors.step1Form().exists)
          .ok(await getErrorMessage(t));
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
          .expect(selectors.contactPersonPhoneInput().value)
          .eql(contact_person_phone_number, await getErrorMessage(t));
      },
    };

    const actions = {
      async fillContactPersonName(name: string) {
        setDataToPrintOnFailure(t, 'contact_person_name', name);
        const input = selectors.contactPersonNameInput();
        await t
          .click(input)
          // eslint-disable-next-line sonarjs/no-duplicate-string
          .pressKey('ctrl+a delete')
          .typeText(input, name);
      },
      async fillContactPersonEmail(email: string) {
        setDataToPrintOnFailure(t, 'contact_person_email', email);
        const input = selectors.contactPersonEmailInput();
        await t.click(input).pressKey('ctrl+a delete').typeText(input, email);
      },
      async fillStreetAddress(address: string) {
        setDataToPrintOnFailure(t, 'street_address', address);
        const input = selectors.streetAddessInput();
        await t.click(input).pressKey('ctrl+a delete').typeText(input, address);
      },
      async fillContactPersonPhone(phone: string) {
        setDataToPrintOnFailure(t, 'contact_person_phone_number', phone);
        const input = selectors.contactPersonPhoneInput();
        await t.click(input).pressKey('ctrl+a delete').typeText(input, phone);
      },
      async clickSaveAndContinueButton() {
        await t.click(selectors.saveAndContinueButton());
      },
      async clickGoToPreviousStepButton() {
        await t.click(selectors.previousStepButton());
      },
    };

    await expectations.isPresent();
    return {
      selectors,
      expectations,
      actions,
    };
  };
  const step2 = async (employeeIndex = 0) => {
    const formSelector = () => commonSelectors.step2Form(employeeIndex);
    const withinForm = (): ReturnType<typeof within> => within(formSelector());

    const selectors = {
      employeeNameInput() {
        return withinForm().findByRole('textbox', {
          name: /työntekijän nimi/i,
        });
      },
      employmentContractAttachmentInput: () =>
        withinForm().findByTestId(
          `summer_vouchers.${employeeIndex}.employment_contract`
        ),
      employmentContractAttachmentButton: () =>
        withinForm().findByRole('button', {
          name: /työsopimus/i,
        }),
      attachmentLink: (attachment: Attachment) =>
        withinForm()
          .findAllByRole('link', {
            name: new RegExp(getAttachmentFileName(attachment), 'i'),
          })
          .nth(0),
      payslipAttachmentInput: () =>
        withinForm().findByTestId(`summer_vouchers.${employeeIndex}.payslip`),
      payslipAttachmentButton: () =>
        withinForm().findByRole('button', {
          name: /palkkatodistus/i,
        }),
      saveAndContinueButton: commonSelectors.saveAndContinueButton,
      previousStepButton: commonSelectors.previousStepButton,
    };
    const expectations = {
      async isPresent() {
        await t
          .expect(formSelector().exists)
          .ok(await getErrorMessage(t), { timeout: 10000 });
      },
      async isAttachmentUploaded(attachment: Attachment) {
        await t
          .expect(selectors.attachmentLink(attachment).exists)
          .ok(await getErrorMessage(t), { timeout: 10000 });
      },
    };

    const actions = {
      async clickSaveAndContinueButton() {
        await t.click(selectors.saveAndContinueButton());
      },
      async clickGoToPreviousStepButton() {
        await t.click(selectors.previousStepButton());
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
    };

    await expectations.isPresent();
    return {
      selectors,
      expectations,
      actions,
    };
  };
  return {
    companyTable,
    step1,
    step2,
  };
};
