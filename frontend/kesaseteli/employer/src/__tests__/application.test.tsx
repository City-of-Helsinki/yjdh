import { axe } from 'jest-axe';
import {
  expectAuthorizedReply,
  expectToGetApplicationErrorReply,
  expectToGetApplicationReply,
  expectUnauthorizedReply,
} from 'kesaseteli/employer/__tests__/utils/backend/backend-nocks';
import renderComponent from 'kesaseteli/employer/__tests__/utils/components/render-component';
import renderPage from 'kesaseteli/employer/__tests__/utils/components/render-page';
import ApplicationPage from 'kesaseteli/employer/pages/application';
import React from 'react';
import { QueryClient } from 'react-query';
import createReactQueryTestClient from 'shared/__tests__/utils/react-query/create-react-query-test-client';
import Company from 'shared/types/company';
import { screen, waitFor } from 'test-utils';

const waitForPageIsLoaded = async (): Promise<void> => {
  await waitFor(() => {
    expect(
      screen.queryByRole('heading', { name: 'common:application.step1.header' })
    ).toBeInTheDocument();
  });
  await waitFor(() => {
    expect(
      screen.queryByText('common:application.step1.form.loading')
    ).not.toBeInTheDocument();
  });
};
const waitForShowingCompanyData = async (company: Company): Promise<void> => {
  await waitForPageIsLoaded();
  expect(screen.queryByText(company.name)).toBeInTheDocument();
  expect(screen.queryByText(company.business_id)).toBeInTheDocument();
  expect(screen.queryByText(company.industry)).toBeInTheDocument();
  expect(screen.queryByText(company.company_form)).toBeInTheDocument();
  expect(screen.queryByText(company.postcode)).toBeInTheDocument();
  expect(screen.queryByText(company.city)).toBeInTheDocument();
};

describe('frontend/kesaseteli/employer/src/pages/application.tsx', () => {
  let queryClient: QueryClient;

  it('should not violate accessibility', async () => {
    const { container } = renderComponent(<ApplicationPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  describe('loading data', () => {
    const id = '1234';
    queryClient = createReactQueryTestClient();
    beforeEach(() => {
      queryClient.clear();
    });

    it('Should redirect when unauthorized', async () => {
      expectUnauthorizedReply();
      const spyPush = jest.fn();
      renderPage(ApplicationPage, queryClient, { push: spyPush });
      await waitFor(() => expect(spyPush).toHaveBeenCalledWith('/login'));
    });

    it('Should show application data', async () => {
      expectAuthorizedReply();
      const expectedApplication = expectToGetApplicationReply(id);
      renderPage(ApplicationPage, queryClient, { query: { id } });
      await waitForShowingCompanyData(expectedApplication.company);
    });

    it('Should show error', async () => {
      expectAuthorizedReply();
      expectToGetApplicationErrorReply(id);
      renderPage(ApplicationPage, queryClient, { query: { id } });
      await waitForPageIsLoaded();
    });
  });
});
