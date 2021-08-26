import {
  expectToGetApplicationErrorFromBackend,
  expectToGetApplicationFromBackend,
  expectToSaveApplication,
} from 'kesaseteli/employer/__tests__/utils/backend/backend-nocks';
import { QueryClient } from 'react-query';
import getErrorPageApi, {
  GetErrorPageApi,
} from 'shared/__tests__/component-apis/get-error-page-api';
import { fakeApplication } from 'shared/__tests__/utils/fake-objects';
import { screen, userEvent, waitFor } from 'shared/__tests__/utils/test-utils';
import Application from 'shared/types/employer-application';

type StepExpections = {
  allApiRequestsDone: () => Promise<void>;
  stepIsLoaded: () => Promise<void>;
  nextButtonIsDisabled: () => Promise<void>;
  nextButtonIsEnabled: () => Promise<void>;
};

type StepActions = {
  clickPreviousButton: () => void;
  clickNextButton: (updatedData?: Partial<Application>) => void;
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
  replyOk: () => { step1: Step1Api; step2: Step2Api; step3: Step3Api };
  replyError: (id: string) => GetErrorPageApi;
};

const waitForHeaderTobeVisible = async (header: RegExp): Promise<void> => {
  await screen.findByRole('heading', { name: header });
};

const typeInput = (inputLabel: RegExp, value: string): void => {
  const input = screen.getByRole('textbox', {
    name: inputLabel,
  });
  userEvent.clear(input);
  if (value?.length > 0) {
    userEvent.type(input, value);
  }
  expect(input).toHaveValue(value);
  userEvent.click(document.body);
};

const expectNextButtonIsEnabled = async (): Promise<void> => {
  await waitFor(() => {
    expect(
      screen.getByRole('button', {
        name: /(tallenna ja jatka)|(application.buttons.save_and_continue)/i,
      })
    ).toBeEnabled();
  });
};

const expectNextButtonIsDisabled = async (): Promise<void> => {
  await waitFor(() => {
    expect(
      screen.getByRole('button', {
        name: /(tallenna ja jatka)|(application.buttons.save_and_continue)/i,
      })
    ).toBeDisabled();
  });
};

const getApplicationPageApi = (
  queryClient: QueryClient,
  applicationId: Application['id']
): ApplicationPageApi => ({
  replyOk: () => {
    const application = fakeApplication(applicationId);
    const requests = [expectToGetApplicationFromBackend(application)];

    const allApiRequestsDone = async (): Promise<void> => {
      await waitFor(() => {
        requests.forEach((req) => expect(req.isDone()).toBeTruthy());
      });
      // clear requests
      requests.length = 0;
    };

    const clickPreviousButton = (): void => {
      expectToGetApplicationFromBackend(application);
      userEvent.click(
        screen.getByRole('button', {
          name: /(palaa edelliseen)|(application.buttons.previous)/i,
        })
      );
    };

    const clickNextButton = (updatedData?: Partial<Application>): void => {
      if (updatedData) {
        const updatedApplication: Application = {
          ...application,
          ...updatedData,
        };
        requests.push(expectToSaveApplication(updatedApplication));
      }
      userEvent.click(
        screen.getByRole('button', {
          name: /(tallenna ja jatka)|(application.buttons.save_and_continue)/i,
        })
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
              screen.queryByLabelText(
                /(yritys$)|(companyinfogrid.header.name)/i
              )
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
          allApiRequestsDone,
        },
        actions: {
          typeInvoicerName: (name: string) =>
            typeInput(/(yhteyshenkilön nimi)|(form.invoicer_name)/i, name),
          typeInvoicerEmail: (email: string) =>
            typeInput(
              /(yhteyshenkilön sähköposti)|(form.invoicer_email)/i,
              email
            ),
          typeInvoicerPhone: (phoneNumber: string) =>
            typeInput(
              /(yhteyshenkilön puhelinnumero)|(form.invoicer_phone_number)/i,
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
          allApiRequestsDone,
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
          allApiRequestsDone,
        },
        actions: {
          clickPreviousButton,
          clickNextButton,
        },
      },
    };
  },
  replyError: (id: string) => {
    expectToGetApplicationErrorFromBackend(id);
    return getErrorPageApi();
  },
});

export default getApplicationPageApi;
