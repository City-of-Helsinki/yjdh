import {
  expectToGetApplicationErrorFromBackend,
  expectToGetApplicationFromBackend,
  expectToSaveApplication,
} from 'kesaseteli/employer/__tests__/utils/backend/backend-nocks';
import { QueryClient } from 'react-query';
import getErrorPageApi, { GetErrorPageApi } from 'shared/__tests__/component-apis/get-error-page-api';
import { fakeApplication } from 'shared/__tests__/utils/fake-objects';
import { screen, userEvent, waitFor } from 'shared/__tests__/utils/test-utils';
import Application from 'shared/types/employer-application';

const expectHeaderTobeVisible = (header: RegExp): void => {
  expect(screen.queryByRole('heading', { name: header })).toBeInTheDocument();
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



export type ApplicationPageApi = {
  replyOk: () => { step1: Step1Api, step2: Step2Api},
  replyError: (id: string) => GetErrorPageApi
}

export type Step1Api = {
  expectations: {
    stepIsLoaded: () => void,
    displayCompanyData: () => void,
    inputValueIsSet:  (key: keyof Application, value?: string) => void,
    inputHasError: (errorText: RegExp) => Promise<void>,
    allApiRequestsDone: () => Promise<void>,
    continueButtonIsDisabled: () => Promise<void>,
  },
  actions: {
    typeInvoicerName: (name: string) => void,
    typeInvoicerEmail: (email: string) => void,
    typeInvoicerPhone: (phoneNumber: string) => void,
    clickContinueButton: (updatedData?: Partial<Application>) => void,
  }
}

export type Step2Api = {
  expectations: {
    stepIsLoaded: () => void,
  },
}




const getApplicationPageApi = (
  queryClient: QueryClient,
  applicationId: Application['id']
): ApplicationPageApi => ({
  replyOk: () => {
    const applicationFromBackend = fakeApplication(applicationId);
    const requests = [expectToGetApplicationFromBackend(applicationFromBackend)];

    return {
      step1: {
        expectations: {
          stepIsLoaded: () => expectHeaderTobeVisible(/(1. työnantajan tiedot)|(application.step1.header)/i),
          displayCompanyData: (): void => {
            const { company } = applicationFromBackend;
            expect(screen.queryByLabelText(/(yritys$)|(companyinfogrid.header.name)/i)).toHaveTextContent(
              company.name
            );
            expect(screen.queryByLabelText(/(y-tunnus)|(companyinfogrid.header.business_id)/i)).toHaveTextContent(
              company.business_id
            );
            expect(screen.queryByLabelText(/(toimiala)|(companyinfogrid.header.industry)/i)).toHaveTextContent(
              company.industry
            );
            expect(screen.queryByLabelText(/(yritysmuoto)|(companyinfogrid.header.company_form)/i)).toHaveTextContent(
              company.company_form
            );
            expect(screen.queryByLabelText(/(postiosoite)|(companyinfogrid.header.postcode)/i)).toHaveTextContent(
              company.postcode
            );
            expect(screen.queryByLabelText(/(kunta)|(companyinfogrid.header.city)/i)).toHaveTextContent(
              company.city
            );
          },

          inputValueIsSet: (key: keyof Application, value?: string): void => {
            const inputValue = value ?? applicationFromBackend[key]?.toString();
            expect(screen.getByTestId(key)).toHaveValue(inputValue);
          },
          inputHasError: async (errorText: RegExp): Promise<void> => {
            screen.debug(screen.getByRole('form'));
            await screen.findByText(errorText);
          },
          allApiRequestsDone: async (): Promise<void> => {
            await waitFor(() => {
              requests.forEach((req) => expect(req.isDone()).toBeTruthy());
            });
            // clear requests
            requests.length = 0;
          },
          continueButtonIsDisabled: async (): Promise<void> => {
            const button = await screen.findByRole('button', {
              name: /(tallenna ja jatka)|(form.submit_button)/i,
            });
            expect(button).toBeDisabled();
          },
        },
        actions: {
          typeInvoicerName: (name: string) =>
            typeInput(/(yhteyshenkilön nimi)|(form.invoicer_name)/i, name),
          typeInvoicerEmail: (email: string) =>
            typeInput(/(yhteyshenkilön sähköposti)|(form.invoicer_name)/i, email),
          typeInvoicerPhone: (phoneNumber: string) =>
            typeInput(/(yhteyshenkilön puhelinnumero)|(form.invoicer_phone_number)/i, phoneNumber),
          clickContinueButton: (updatedData?: Partial<Application>): void => {
            if (updatedData) {
              const updatedApplication: Application = {
                ...applicationFromBackend,
                ...updatedData,
              };
              requests.push(expectToSaveApplication(updatedApplication));
            }
            userEvent.click(
              screen.getByRole('button', {
                name: /(tallenna ja jatka)|(application.buttons.save_and_continue)/i,
              })
            );
          },
        },
      },
      step2: {
        expectations: {
          stepIsLoaded: () =>
            expectHeaderTobeVisible(/(2. selvitys työsuhteesta)|(application.step2.header)/i),
        },
      },
    };
  },
  replyError: (id: string) => {
    expectToGetApplicationErrorFromBackend(id)
    return getErrorPageApi()
  },
});

export default getApplicationPageApi;
