import { axe } from 'jest-axe';
import {
  expectAuthorizedReply,
  expectToGetApplicationErrorFromBackend,
  expectToGetApplicationFromBackend,
  expectToSaveApplication,
  expectUnauthorizedReply,
} from 'kesaseteli/employer/__tests__/utils/backend/backend-nocks';
import renderComponent from 'kesaseteli/employer/__tests__/utils/components/render-component';
import renderPage from 'kesaseteli/employer/__tests__/utils/components/render-page';
import ApplicationPage from 'kesaseteli/employer/pages/application';
import nock from 'nock';
import React from 'react';
import { QueryClient } from 'react-query';
import { fakeApplication } from 'shared/__tests__/utils/fake-objects';
import createReactQueryTestClient from 'shared/__tests__/utils/react-query/create-react-query-test-client';
import { screen, userEvent, waitFor } from 'shared/__tests__/utils/test-utils';
import { DEFAULT_LANGUAGE, Language } from 'shared/i18n/i18n';
import type Application from 'shared/types/employer-application';

const waitForHeadingVisible = async (header: string): Promise<void> => {
  await waitFor(() => {
    expect(screen.queryByRole('heading', { name: header })).toBeInTheDocument();
  });

  await waitFor(() => {
    expect(
      screen.queryByRole('alert', { hidden: true })
    ).not.toBeInTheDocument();
  });
};
const waitForPageIsLoaded = (): Promise<void> =>
  waitForHeadingVisible('Uusi hakemus');
const waitForStep1IsLoaded = (): Promise<void> =>
  waitForHeadingVisible('1. Työnantajan tiedot');
const waitForStep2IsLoaded = (): Promise<void> =>
  waitForHeadingVisible('2. Selvitys työsuhteesta');

const typeInput = (inputLabel: string, value: string): void => {
  const input = screen.getByRole('textbox', {
    name: new RegExp(inputLabel, 'i'),
  });
  userEvent.clear(input);
  if (value?.length > 0) {
    userEvent.type(input, value);
  }
  expect(input).toHaveValue(value);
  userEvent.click(document.body);
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const getApplicationPageApi = (
  queryClient: QueryClient,
  applicationId: Application['id']
) => ({
  replyOk: () => {
    const applicationFromBackend = fakeApplication(applicationId);
    const requests: nock.Scope[] = [];
    requests.push(expectToGetApplicationFromBackend(applicationFromBackend));

    return {
      step1: {
        expectations: {
          stepIsLoaded: waitForStep1IsLoaded,
          displayCompanyData: async (): Promise<void> => {
            await waitForStep1IsLoaded();
            const { company } = applicationFromBackend;
            expect(screen.queryByLabelText('Yritys')).toHaveTextContent(
              company.name
            );
            expect(screen.queryByLabelText('Y-tunnus')).toHaveTextContent(
              company.business_id
            );
            expect(screen.queryByLabelText('Toimiala')).toHaveTextContent(
              company.industry
            );
            expect(screen.queryByLabelText('Yritysmuoto')).toHaveTextContent(
              company.company_form
            );
            expect(screen.queryByLabelText('Postiosoite')).toHaveTextContent(
              company.postcode
            );
            expect(screen.queryByLabelText('Kunta')).toHaveTextContent(
              company.city
            );
          },

          inputValueIsSet: (key: keyof Application, value?: string): void => {
            const inputValue = value ?? applicationFromBackend[key]?.toString();
            expect(screen.getByTestId(key)).toHaveValue(inputValue);
          },
          inputHasError: async (errorText: string): Promise<void> => {
            await screen.findByText(errorText);
          },
          allApiRequestsDone: async () => {
            await waitFor(() => {
              requests.forEach((req) => expect(req.isDone()).toBeTruthy());
            });
            // clear requests
            requests.length = 0;
          },
          continueButtonIsDisabled: async (): Promise<void> => {
            const button = await screen.findByRole('button', {
              name: 'Tallenna ja jatka',
            });
            expect(button).toBeDisabled();
          },
        },
        actions: {
          typeInvoicerName: (name: string) =>
            typeInput('Yhteyshenkilön nimi', name),
          typeInvoicerEmail: (email: string) =>
            typeInput('Yhteyshenkilön sähköposti', email),
          typeInvoicerPhone: (phoneNumber: string) =>
            typeInput('Yhteyshenkilön puhelinnumero', phoneNumber),
          clickContinueButton: (override: Partial<Application> = {}): void => {
            const updatedApplication: Application = {
              ...applicationFromBackend,
              ...override,
            };
            requests.push(expectToSaveApplication(updatedApplication));
            userEvent.click(
              screen.getByRole('button', {
                name: /tallenna ja jatka/i,
              })
            );
          },
        },
      },
      step2: {
        expectations: {
          stepIsLoaded: waitForStep2IsLoaded,
        },
      },
    };
  },
  replyError: () => {
    const applicationFromBackend = fakeApplication(applicationId);
    expectToGetApplicationErrorFromBackend(applicationId);
    return {
      expectations: {
        displayCommonError: async (): Promise<void> => {
          await waitForPageIsLoaded();
          expect(
            screen.getByRole('heading', {
              name: /tapahtui tuntematon virhe/i,
            })
          ).toBeInTheDocument();
        },
        doesntDisplayCompanyData: async (): Promise<void> => {
          await waitForPageIsLoaded();
          const { company } = applicationFromBackend;
          expect(screen.queryByText(company.name)).not.toBeInTheDocument();
          expect(
            screen.queryByText(company.business_id)
          ).not.toBeInTheDocument();
          expect(screen.queryByText(company.industry)).not.toBeInTheDocument();
          expect(
            screen.queryByText(company.company_form)
          ).not.toBeInTheDocument();
          expect(screen.queryByText(company.postcode)).not.toBeInTheDocument();
          expect(screen.queryByText(company.city)).not.toBeInTheDocument();
        },
      },
    };
  },
});

describe('frontend/kesaseteli/employer/src/pages/application.tsx', () => {
  let queryClient: QueryClient;

  afterEach(() => {
    nock.cleanAll();
  });

  it('should not violate accessibility', async () => {
    const { container } = renderComponent(<ApplicationPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  describe('loading data', () => {
    const id = '1234';
    let applicationApi: ReturnType<typeof getApplicationPageApi>;
    queryClient = createReactQueryTestClient();

    beforeEach(() => {
      queryClient.clear();
      applicationApi = getApplicationPageApi(queryClient, id);
    });

    it('Should redirect when unauthorized', async () => {
      expectUnauthorizedReply();
      const spyPush = jest.fn();
      renderPage(ApplicationPage, queryClient, { push: spyPush });
      await waitFor(() => expect(spyPush).toHaveBeenCalledWith('/login'));
    });

    describe('when authorized', () => {
      beforeEach(() => {
        expectAuthorizedReply();
      });

      it('Should show applicaton loading error', async () => {
        const applicationPage = applicationApi.replyError();
        renderPage(ApplicationPage, queryClient, { query: { id } });
        await applicationPage.expectations.displayCommonError();
        await applicationPage.expectations.doesntDisplayCompanyData();
      });

      it('Should route to index page with default lang when applicaton id and locale is missing', async () => {
        const spyReplace = jest.fn();
        renderPage(ApplicationPage, queryClient, {
          replace: spyReplace,
          query: {},
        });
        await waitFor(() =>
          expect(spyReplace).toHaveBeenCalledWith(`${DEFAULT_LANGUAGE}/`)
        );
      });

      it('Should route to index page with locale when applicaton id is missing', async () => {
        const locale: Language = 'en';
        const spyReplace = jest.fn();
        renderPage(ApplicationPage, queryClient, {
          replace: spyReplace,
          query: {},
          locale,
        });
        await waitFor(() =>
          expect(spyReplace).toHaveBeenCalledWith(`${locale}/`)
        );
      });
      describe('when getting application data', () => {
        let applicationPage: ReturnType<typeof applicationApi.replyOk>;
        beforeEach(() => {
          applicationPage = applicationApi.replyOk();
        });
        it('shows validation errors and disables continue button when missing values', async () => {
          renderPage(ApplicationPage, queryClient, { query: { id } });
          await applicationPage.step1.expectations.stepIsLoaded();
          applicationPage.step1.actions.typeInvoicerName('');
          await applicationPage.step1.expectations.inputHasError(
            'Nimi puuttuu'
          );
          applicationPage.step1.actions.typeInvoicerEmail('´');
          await applicationPage.step1.expectations.inputHasError(
            'Sähköposti on virheellinen'
          );
          applicationPage.step1.actions.typeInvoicerPhone('');
          await applicationPage.step1.expectations.inputHasError(
            'Puhelinnumero on virheellinen'
          );
          await applicationPage.step1.expectations.continueButtonIsDisabled();
        });

        it('shows validation errors when invalid values', async () => {
          renderPage(ApplicationPage, queryClient, { query: { id } });
          await applicationPage.step1.expectations.stepIsLoaded();
          applicationPage.step1.actions.typeInvoicerName('a'.repeat(257)); // max limit is 256
          await applicationPage.step1.expectations.inputHasError(
            'Nimi puuttuu'
          );
          applicationPage.step1.actions.typeInvoicerEmail('john@doe');
          await applicationPage.step1.expectations.inputHasError(
            'Sähköposti on virheellinen'
          );
          applicationPage.step1.actions.typeInvoicerPhone('1'.repeat(65)); // max limit is 64
          await applicationPage.step1.expectations.inputHasError(
            'Puhelinnumero on virheellinen'
          );
        });
        it('saves application and goes to step 2 when next button is clicked', async () => {
          renderPage(ApplicationPage, queryClient, { query: { id } });
          await applicationPage.step1.expectations.displayCompanyData();
          applicationPage.step1.expectations.inputValueIsSet('invoicer_name');
          applicationPage.step1.expectations.inputValueIsSet('invoicer_email');
          applicationPage.step1.expectations.inputValueIsSet(
            'invoicer_phone_number'
          );
          const invoicer_name = 'John Doe';
          const invoicer_email = 'john@doe.com';
          const invoicer_phone_number = '+358503758288';
          applicationPage.step1.actions.typeInvoicerName(invoicer_name);
          applicationPage.step1.actions.typeInvoicerEmail(invoicer_email);
          applicationPage.step1.actions.typeInvoicerPhone(
            invoicer_phone_number
          );
          applicationPage.step1.actions.clickContinueButton({
            invoicer_name,
            invoicer_email,
            invoicer_phone_number,
          });
          await applicationPage.step1.expectations.allApiRequestsDone();
          await applicationPage.step2.expectations.stepIsLoaded();
        });
      });
    });
  });
});
