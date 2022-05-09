import {
  expectToGetApplicationFromBackend,
  expectToSaveApplication,
} from 'kesaseteli-shared/__tests__/utils/backend/backend-nocks';
import nock from 'nock';
import { waitForBackendRequestsToComplete } from 'shared/__tests__/utils/component.utils';
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
  };
  actions: StepActions & {
    typeContactPersonName: (name: string) => Promise<void>;
    typeContactPersonEmail: (email: string) => Promise<void>;
    typeStreetAddress: (streetAddress: string) => Promise<void>;
    typeContactPersonPhone: (phoneNumber: string) => Promise<void>;
  };
};

type Step2Api = {
  expectations: StepExpections;
  actions: StepActions;
};

type Step3Api = {
  expectations: StepExpections;
  actions: StepActions;
};

export type ApplicationPageApi = {
  step1: Step1Api;
  step2: Step2Api;
  step3: Step3Api;
};

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
    // for some reason userEvent.clear(input) doesnt work
    // eslint-disable-next-line no-plusplus
    for (let i=0; i < application[key]?.length ?? 0; i++) {
      await userEvent.type(input, '{backspace}');
    }
    if (value?.length > 0) {
      await userEvent.type(input, value);
    }
    expect(input).toHaveValue(value ?? '');
    application[key] = value ?? '';
    return userEvent.click(document.body);
  };

  const clickNextButton = async (): Promise<nock.Scope[]> => {
    await waitForBackendRequestsToComplete();
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
            /(työpaikan lähiosoite)|(inputs.street_address)/i,
            streetAddress
          ),
        typeContactPersonPhone: (phoneNumber: string) =>
          typeInput(
            'contact_person_phone_number',
            /(yhteyshenkilön puhelinnumero)|(inputs.contact_person_phone_number)/i,
            phoneNumber
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
            /(2. selvitys työsuhteesta)|(application.step2.header)/i
          ),
        nextButtonIsDisabled: expectNextButtonIsDisabled,
        nextButtonIsEnabled: expectNextButtonIsEnabled,
      },
      actions: {
        clickPreviousButton,
        clickNextButton,
        clickNextButtonAndExpectToSaveApplication,
      },
    },
    step3: {
      expectations: {
        stepIsLoaded: () =>
          waitForHeaderTobeVisible(
            /(3. tarkistus ja lähettäminen)|(application.step3.header)/i
          ),
        nextButtonIsDisabled: expectNextButtonIsDisabled,
        nextButtonIsEnabled: expectNextButtonIsEnabled,
      },
      actions: {
        clickPreviousButton,
        clickNextButton,
        clickNextButtonAndExpectToSaveApplication,
      },
    },
  };
};

export default getApplicationPageApi;
