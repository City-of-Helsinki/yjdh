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
import { fakeApplication } from 'kesaseteli/employer/__tests__/utils/fake-objects';
import ApplicationPage from 'kesaseteli/employer/pages/application';
import Application from 'kesaseteli/employer/types/application';
import nock from 'nock';
import React from 'react';
import { QueryClient } from 'react-query';
import createReactQueryTestClient from 'shared/__tests__/utils/react-query/create-react-query-test-client';
import { DEFAULT_LANGUAGE, Language } from 'shared/i18n/i18n';
import { screen, userEvent, waitFor } from 'test-utils';

const waitForPageIsLoaded = async (): Promise<void> => {
  await waitFor(() => {
    expect(
      screen.queryByRole('heading', { name: /step1.header/i })
    ).toBeInTheDocument();
  });
  await waitFor(() => {
    expect(screen.queryByText(/form.loading/i)).not.toBeInTheDocument();
  });
};

const typeInput = (inputName: keyof Application, value: string): void => {
  const input = screen.getByRole('textbox', {
    name: new RegExp(inputName, 'i'),
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
      expectations: {
        pageIsLoaded: waitForPageIsLoaded,
        displayCompanyData: async (): Promise<void> => {
          await waitForPageIsLoaded();
          const { company } = applicationFromBackend;
          expect(screen.queryByText(company.name)).toBeInTheDocument();
          expect(screen.queryByText(company.business_id)).toBeInTheDocument();
          expect(screen.queryByText(company.industry)).toBeInTheDocument();
          expect(screen.queryByText(company.company_form)).toBeInTheDocument();
          expect(screen.queryByText(company.postcode)).toBeInTheDocument();
          expect(screen.queryByText(company.city)).toBeInTheDocument();
        },

        inputValueIsSet: (
          inputName: keyof Application,
          value?: string
        ): void => {
          const inputValue =
            value ?? applicationFromBackend[inputName]?.toString();
          expect(
            screen.queryByRole('textbox', {
              name: new RegExp(inputName, 'i'),
            })
          ).toHaveValue(inputValue);
        },
        inputHasError: async (inputName: keyof Application): Promise<void> => {
          await screen.findByText(new RegExp(`errors.${inputName}`, 'i'));
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
            name: /submit_button/i,
          });
          expect(button).toBeDisabled();
        },
      },
      actions: {
        typeInvoicerName: (name: string) => typeInput('invoicer_name', name),
        typeInvoicerEmail: (email: string) =>
          typeInput('invoicer_email', email),
        typeInvoicerPhone: (phoneNumber: string) =>
          typeInput('invoicer_phone_number', phoneNumber),
        clickContinueButton: (override: Partial<Application> = {}): void => {
          const updatedApplication: Application = {
            ...applicationFromBackend,
            ...override,
          };
          requests.push(expectToSaveApplication(updatedApplication));
          userEvent.click(
            screen.getByRole('button', {
              name: /submit_button/i,
            })
          );
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
              name: /common_error/i,
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
        const spyPush = jest.fn();
        renderPage(ApplicationPage, queryClient, { push: spyPush, query: {} });
        await waitFor(() =>
          expect(spyPush).toHaveBeenCalledWith(`${DEFAULT_LANGUAGE}/`)
        );
      });

      it('Should route to index page with locale when applicaton id is missing', async () => {
        const locale: Language = 'en';
        const spyPush = jest.fn();
        renderPage(ApplicationPage, queryClient, {
          push: spyPush,
          query: {},
          locale,
        });
        await waitFor(() => expect(spyPush).toHaveBeenCalledWith(`${locale}/`));
      });
      describe('when getting application data', () => {
        let applicationPage: ReturnType<typeof applicationApi.replyOk>;
        beforeEach(() => {
          applicationPage = applicationApi.replyOk();
        });
        it('updates application data when next button is clicked', async () => {
          renderPage(ApplicationPage, queryClient, { query: { id } });
          await applicationPage.expectations.displayCompanyData();
          applicationPage.expectations.inputValueIsSet('invoicer_name');
          applicationPage.expectations.inputValueIsSet('invoicer_email');
          applicationPage.expectations.inputValueIsSet('invoicer_phone_number');
          const invoicer_name = 'John Doe';
          const invoicer_email = 'john@doe.com';
          const invoicer_phone_number = '+358503758288';
          applicationPage.actions.typeInvoicerName(invoicer_name);
          applicationPage.actions.typeInvoicerEmail(invoicer_email);
          applicationPage.actions.typeInvoicerPhone(invoicer_phone_number);
          applicationPage.actions.clickContinueButton({
            invoicer_name,
            invoicer_email,
            invoicer_phone_number,
          });
          await applicationPage.expectations.allApiRequestsDone();
          applicationPage.expectations.inputValueIsSet(
            'invoicer_name',
            invoicer_name
          );
          applicationPage.expectations.inputValueIsSet(
            'invoicer_email',
            invoicer_email
          );
          applicationPage.expectations.inputValueIsSet(
            'invoicer_phone_number',
            invoicer_phone_number
          );
        });

        it('shows validation errors and disables continue button when missing values', async () => {
          renderPage(ApplicationPage, queryClient, { query: { id } });
          await applicationPage.expectations.pageIsLoaded();
          applicationPage.actions.typeInvoicerName('');
          await applicationPage.expectations.inputHasError('invoicer_name');
          applicationPage.actions.typeInvoicerEmail('´');
          await applicationPage.expectations.inputHasError('invoicer_email');
          applicationPage.actions.typeInvoicerPhone('');
          await applicationPage.expectations.inputHasError(
            'invoicer_phone_number'
          );
          await applicationPage.expectations.continueButtonIsDisabled();
        });

        it('shows validation errors when invalid values', async () => {
          renderPage(ApplicationPage, queryClient, { query: { id } });
          await applicationPage.expectations.pageIsLoaded();
          applicationPage.actions.typeInvoicerName('a'.repeat(257)); // max limit is 256
          await applicationPage.expectations.inputHasError('invoicer_name');
          applicationPage.actions.typeInvoicerEmail('john@doe');
          await applicationPage.expectations.inputHasError('invoicer_email');
          applicationPage.actions.typeInvoicerPhone('1'.repeat(65)); // max limit is 64
          await applicationPage.expectations.inputHasError(
            'invoicer_phone_number'
          );
        });
      });
    });
  });
});
