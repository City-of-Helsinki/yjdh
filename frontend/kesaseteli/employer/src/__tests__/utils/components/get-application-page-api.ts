import { expectToSaveApplication } from 'kesaseteli/employer/__tests__/utils/backend/backend-nocks';
import { QueryClient } from 'react-query';
import { expectBackendRequestsToComplete } from 'shared/__tests__/utils/component.utils';
import { screen, userEvent, waitFor } from 'shared/__tests__/utils/test-utils';
import Application from 'shared/types/employer-application';
import Invoicer from 'shared/types/invoicer';

type StepExpections = {
  stepIsLoaded: () => Promise<void>;
  nextButtonIsDisabled: () => void;
  nextButtonIsEnabled: () => void;
};

type StepActions = {
  clickPreviousButton: () => void;
  clickNextButton: () => Promise<void>;
};

type Step1Api = {
  expectations: StepExpections & {
    displayCompanyData: () => void;
    inputValueIsSet: (key: keyof Application, value?: string) => void;
    inputHasError: (errorText: RegExp) => Promise<void>;
  };
  actions: StepActions & {
    typeInvoicerName: (name: string) => void;
    typeInvoicerEmail: (email: string) => void;
    typeInvoicerPhone: (phoneNumber: string) => void;
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
  await waitFor(() => {
    expectBackendRequestsToComplete();
    expect(screen.getByRole('heading', { name: header })).toBeInTheDocument();
  });
};

const expectNextButtonIsEnabled = (): void => {
  expect(
    screen.getByRole('button', {
      name: /(tallenna ja jatka)|(application.buttons.save_and_continue)/i,
    })
  ).toBeEnabled();
};

const expectNextButtonIsDisabled = (): void => {
  expect(
    screen.getByRole('button', {
      name: /(tallenna ja jatka)|(application.buttons.save_and_continue)/i,
    })
  ).toBeDisabled();
};

const clickPreviousButton = (): void => {
  userEvent.click(
    screen.getByRole('button', {
      name: /(palaa edelliseen)|(application.buttons.previous)/i,
    })
  );
};

const getApplicationPageApi = (
  queryClient: QueryClient,
  initialApplication: Application
): ApplicationPageApi => {
  const application = { ...initialApplication };

  const typeInput = (
    key: keyof Invoicer,
    inputLabel: RegExp,
    value: string
  ): void => {
    const input = screen.getByRole('textbox', {
      name: inputLabel,
    });
    userEvent.clear(input);
    if (value?.length > 0) {
      userEvent.type(input, value);
    }
    expect(input).toHaveValue(value);
    application[key] = value ?? '';
    userEvent.click(document.body);
  };

  const clickNextButton = async (): Promise<void> => {
    const [options, put] = expectToSaveApplication(application);
    expectNextButtonIsEnabled();
    userEvent.click(
      screen.getByRole('button', {
        name: /(tallenna ja jatka)|(application.buttons.save_and_continue)/i,
      })
    );
    await waitFor(() => options.done());
    await waitFor(() => put.done());
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
          expect(screen.getByTestId(key)).toHaveValue(inputValue);
        },
        inputHasError: async (errorText: RegExp): Promise<void> => {
          await screen.findByText(errorText);
        },
        nextButtonIsDisabled: expectNextButtonIsDisabled,
        nextButtonIsEnabled: expectNextButtonIsEnabled,
      },
      actions: {
        typeInvoicerName: (name: string) =>
          typeInput(
            'invoicer_name',
            /(yhteyshenkilön nimi)|(inputs.invoicer_name)/i,
            name
          ),
        typeInvoicerEmail: (email: string) =>
          typeInput(
            'invoicer_email',
            /(yhteyshenkilön sähköposti)|(inputs.invoicer_email)/i,
            email
          ),
        typeInvoicerPhone: (phoneNumber: string) =>
          typeInput(
            'invoicer_phone_number',
            /(yhteyshenkilön puhelinnumero)|(inputs.invoicer_phone_number)/i,
            phoneNumber
          ),
        clickPreviousButton,
        clickNextButton,
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
      },
    },
  };
};

export default getApplicationPageApi;
