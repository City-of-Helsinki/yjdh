import { expectToGetApplicationFromBackend } from 'kesaseteli-shared/__tests__/utils/backend/backend-nocks';
import {
  BackendEndpoint,
  getBackendDomain,
} from 'kesaseteli-shared/backend-api/backend-api';
import nock from 'nock';
import {
  waitForBackendRequestsToComplete,
  waitForLoadingCompleted,
} from 'shared/__tests__/utils/component.utils';
import JEST_TIMEOUT from 'shared/__tests__/utils/jest-timeout';
import { screen, userEvent, waitFor } from 'shared/__tests__/utils/test-utils';
import Application from 'shared/types/application';
import ContactPerson from 'shared/types/contact-info';

type StepExpections = {
  stepIsLoaded: () => Promise<void>;
  nextButtonIsDisabled: () => void;
  nextButtonIsEnabled: () => void;
};

type StepActions = {
  clickPreviousButton: () => Promise<void>;
  clickNextButton: () => Promise<nock.Scope[]>;
  clickNextButtonAndExpectToSaveApplication: () => Promise<void>;
};

type Step1Api = {
  expectations: StepExpections & {
    displayCompanyData: () => void;
    inputValueIsSet: (key: keyof Application, value?: string) => void;
    inputHasError: (key: keyof Application, errorText: RegExp) => Promise<void>;
    expectForeignIbanNote: (visible: boolean) => Promise<void>;
    expectForeignIbanFieldsVisible: (visible: boolean) => void;
    expectNoValidationError: (key: keyof Application) => void;
  };
  actions: StepActions & {
    typeContactPersonName: (name: string) => Promise<void>;
    typeContactPersonEmail: (email: string) => Promise<void>;
    typeStreetAddress: (streetAddress: string) => Promise<void>;
    typeContactPersonPhone: (phoneNumber: string) => Promise<void>;
    typeIban: (iban: string) => Promise<void>;
    typeIbanWithoutBlur: (iban: string) => Promise<void>;
    typePayeeName: (name: string) => Promise<void>;
    typePayeeAddress: (address: string) => Promise<void>;
    typeBankSwiftBicCode: (code: string) => Promise<void>;
    typeBankName: (name: string) => Promise<void>;
    typeBankAddress: (address: string) => Promise<void>;
  };
};

type Step2Api = {
  expectations: StepExpections & {
    nextButtonIsEnabled: () => void;
  };
  actions: StepActions & {
    toggleTermsAndConditions: () => Promise<void>;
  };
};

export type ApplicationPageApi = {
  step1: Step1Api;
  step2: Step2Api;
};

const expectToSaveApplication = (applicationToSave: Application): nock.Scope =>
  nock(getBackendDomain())
    .put(
      `${BackendEndpoint.EMPLOYER_APPLICATIONS}${applicationToSave.id}/`,
      (body: Application) =>
        body.id === applicationToSave.id &&
        body.status === (applicationToSave.status ?? 'draft')
    )
    .reply(200, applicationToSave, { 'Access-Control-Allow-Origin': '*' });

const waitForHeaderTobeVisible = async (header: RegExp): Promise<void> => {
  await screen.findByRole(
    'heading',
    { name: header },
    { timeout: JEST_TIMEOUT }
  );

  await waitForBackendRequestsToComplete();
};

const expectNextButtonIsEnabled = (): void => {
  expect(
    screen.getByRole('button', {
      name: /(tallenna ja jatka)|(application.buttons.next)/i,
    })
  ).toBeEnabled();
};

const expectNextButtonIsDisabled = (): void => {
  expect(
    screen.getByRole('button', {
      name: /(tallenna ja jatka)|(application.buttons.next)/i,
    })
  ).toBeDisabled();
};

const expectPreviousButtonIsEnabled = (): void => {
  expect(
    screen.getByRole('button', {
      name: /(palaa edelliseen)|(application.buttons.previous)/i,
    })
  ).toBeEnabled();
};

const waitForNextButtonIsEnabled = async (): Promise<void> => {
  await waitFor(expectNextButtonIsEnabled);
};

const waitForPreviousButtonIsEnabled = async (): Promise<void> => {
  await waitFor(expectPreviousButtonIsEnabled);
};

const clickPreviousButton = async (): Promise<void> => {
  await waitForPreviousButtonIsEnabled();
  return userEvent.click(
    screen.getByRole('button', {
      name: /(palaa edelliseen)|(application.buttons.previous)/i,
    })
  );
};

const getApplicationPageApi = (
  initialApplication: Application
): ApplicationPageApi => {
  const application = { ...initialApplication };

  const typeInput = async (
    key: keyof ContactPerson,
    inputLabel: RegExp,
    value: string
  ): Promise<void> => {
    const input = screen.getByRole<HTMLInputElement>('textbox', {
      name: inputLabel,
    });
    const currentLength = input.value.length;
    if (currentLength > 0) {
      await userEvent.type(input, '{backspace}'.repeat(currentLength));
    }
    if (value) {
      await userEvent.type(input, value);
    }
    expect(input).toHaveValue(value ?? '');
    application[key] = value ?? '';
    return userEvent.click(document.body);
  };

  const clickNextButton = async (): Promise<nock.Scope[]> => {
    await waitForLoadingCompleted();
    await waitForNextButtonIsEnabled();
    const put = expectToSaveApplication(application);
    const get = expectToGetApplicationFromBackend(application);
    await userEvent.click(
      screen.getByRole('button', {
        name: /(tallenna ja jatka)|(application.buttons.next)/i,
      })
    );
    return [put, get];
  };

  const clickNextButtonAndExpectToSaveApplication = async (): Promise<void> => {
    const expectations = await clickNextButton();
    await Promise.all(
      expectations.map((expectation) =>
        waitFor(() => {
          expectation.done();
        })
      )
    );
  };

  const typeIbanWithoutBlur = async (iban: string): Promise<void> => {
    const input = screen.getByTestId<HTMLInputElement>('bank_account_number');
    await userEvent.clear(input);
    if (iban) {
      await userEvent.type(input, iban);
    }
    application.bank_account_number = iban ?? '';
  };

  return {
    step1: {
      expectations: {
        stepIsLoaded: () =>
          waitForHeaderTobeVisible(
            /(1. työnantajan tiedot)|(application.step1.header)/i
          ),
        displayCompanyData: (): void => {
          const { company } = application;
          expect(
            screen.queryByLabelText(/(yritys$)|(companyinfogrid.header.name)/i)
          ).toHaveTextContent(company.name);
          expect(
            screen.queryByLabelText(
              /(y-tunnus)|(companyinfogrid.header.business_id)/i
            )
          ).toHaveTextContent(company.business_id);
          expect(
            screen.queryByLabelText(
              /(toimiala)|(companyinfogrid.header.industry)/i
            )
          ).toHaveTextContent(company.industry);
          expect(
            screen.queryByLabelText(
              /(yritysmuoto)|(companyinfogrid.header.company_form)/i
            )
          ).toHaveTextContent(company.company_form);
          expect(
            screen.queryByLabelText(
              /(postiosoite)|(companyinfogrid.header.postcode)/i
            )
          ).toHaveTextContent(company.postcode);
          expect(
            screen.queryByLabelText(/(kunta)|(companyinfogrid.header.city)/i)
          ).toHaveTextContent(company.city);
        },

        inputValueIsSet: (key: keyof Application, value?: string): void => {
          const inputValue = value ?? application[key]?.toString();
          expect(screen.getByTestId(key as string)).toHaveValue(inputValue);
        },
        inputHasError: async (
          key: keyof Application,
          errorText: RegExp
        ): Promise<void> => {
          await waitFor(() =>
            expect(
              screen.getByTestId(key as string)?.parentElement?.nextSibling
                ?.textContent
            ).toMatch(errorText)
          );
        },
        expectForeignIbanNote: async (visible: boolean): Promise<void> => {
          // eslint-disable-next-line unicorn/prefer-ternary
          if (visible) {
            await screen.findByTestId('foreign-iban-notification', undefined, {
              timeout: 5000,
            });
          } else {
            await waitFor(
              () =>
                expect(
                  screen.queryByTestId('foreign-iban-notification')
                ).not.toBeInTheDocument(),
              { timeout: 5000 }
            );
          }
        },
        expectForeignIbanFieldsVisible: (visible: boolean): void => {
          const fields = [
            'payee_name',
            'payee_address',
            'bank_swift_bic_code',
            'bank_name',
            'bank_address',
          ];
          fields.forEach((field) => {
            if (visible) {
              expect(screen.getByTestId(field)).toBeVisible();
            } else {
              expect(screen.queryByTestId(field)).not.toBeInTheDocument();
            }
          });
        },
        expectNoValidationError: (key: keyof Application): void => {
          expect(
            screen.queryByTestId(`${key as string}-error`)
          ).not.toBeInTheDocument();
        },
        nextButtonIsDisabled: expectNextButtonIsDisabled,
        nextButtonIsEnabled: expectNextButtonIsEnabled,
      },
      actions: {
        typeContactPersonName: (name: string) =>
          typeInput(
            'contact_person_name',
            /(yhteyshenkilön nimi)|(inputs.contact_person_name)/i,
            name
          ),
        typeContactPersonEmail: (email: string) =>
          typeInput(
            'contact_person_email',
            /(yhteyshenkilön sähköposti)|(inputs.contact_person_email)/i,
            email
          ),
        typeStreetAddress: (streetAddress: string) =>
          typeInput(
            'street_address',
            /(yrityksen osoite)|(inputs.street_address)/i,
            streetAddress
          ),
        typeContactPersonPhone: (phoneNumber: string) =>
          typeInput(
            'contact_person_phone_number',
            /(yhteyshenkilön puhelinnumero)|(inputs.contact_person_phone_number)/i,
            phoneNumber
          ),
        typeIban: async (iban: string) => {
          await typeIbanWithoutBlur(iban);
          return userEvent.click(document.body);
        },
        typeIbanWithoutBlur,
        typePayeeName: (name: string) =>
          typeInput(
            'payee_name',
            /(maksunsaajan nimi)|(inputs.payee_name)/i,
            name
          ),
        typePayeeAddress: (address: string) =>
          typeInput(
            'payee_address',
            /(maksunsaajan osoite)|(inputs.payee_address)/i,
            address
          ),
        typeBankSwiftBicCode: (code: string) =>
          typeInput(
            'bank_swift_bic_code',
            /(pankin swift \/ bic koodi)|(inputs.bank_swift_bic_code)/i,
            code
          ),
        typeBankName: (name: string) =>
          typeInput('bank_name', /(pankin nimi)|(inputs.bank_name)/i, name),
        typeBankAddress: (address: string) =>
          typeInput(
            'bank_address',
            /(pankin käyntiosoite)|(inputs.bank_address)/i,
            address
          ),
        clickPreviousButton,
        clickNextButton,
        clickNextButtonAndExpectToSaveApplication,
      },
    },
    step2: {
      expectations: {
        stepIsLoaded: () =>
          waitForHeaderTobeVisible(
            /(2. selvitys työsuhteesta)|(2. tarkistus ja lähettäminen)|(application.step2.header)/i
          ),
        nextButtonIsEnabled: () => {
          expect(
            screen.getByRole('button', {
              name: /(lähetä hakemus)|(application.buttons.last)/i,
            })
          ).toBeEnabled();
        },
        nextButtonIsDisabled: () => {
          // Button is never disabled in Step 2 (ActionButtons doesn't support it)
        },
      },
      actions: {
        clickPreviousButton,
        clickNextButton: async (): Promise<nock.Scope[]> => {
          await waitForLoadingCompleted();
          await waitFor(() => {
            expect(
              screen.getByRole('button', {
                name: /(lähetä hakemus)|(application.buttons.last)/i,
              })
            ).toBeEnabled();
          });
          const put = expectToSaveApplication({
            ...application,
            status: 'submitted',
          });
          const get = expectToGetApplicationFromBackend(application);
          await userEvent.click(
            screen.getByRole('button', {
              name: /(lähetä hakemus)|(application.buttons.last)/i,
            })
          );
          return [put, get];
        },
        clickNextButtonAndExpectToSaveApplication: async (): Promise<void> => {
          await waitForLoadingCompleted();
          await waitFor(() => {
            expect(
              screen.getByRole('button', {
                name: /(lähetä hakemus)|(application.buttons.last)/i,
              })
            ).toBeEnabled();
          });
          const put = expectToSaveApplication({
            ...application,
            status: 'submitted',
          });
          await userEvent.click(
            screen.getByRole('button', {
              name: /(lähetä hakemus)|(application.buttons.last)/i,
            })
          );
          await waitFor(() => {
            put.done();
          });
        },
        toggleTermsAndConditions: async (): Promise<void> => {
          const checkbox = screen.getByLabelText(
            /(käyttöehdot)|(application.form.inputs.termsandconditions)/i
          );
          await userEvent.click(checkbox);
          await waitFor(() => expect(checkbox).toBeChecked());
        },
      },
    },
  };
};

export default getApplicationPageApi;
