import { axe } from 'jest-axe';
import {
  expectAuthorizedReply,
  expectToGetCompanyErrorReply,
  expectToGetCompanyReply,
  expectUnauthorizedReply,
} from 'kesaseteli/employer/__tests__/utils/backend/backend-nocks';
import renderComponent from 'kesaseteli/employer/__tests__/utils/components/render-component';
import renderPage from 'kesaseteli/employer/__tests__/utils/components/render-page';
import CompanyPage from 'kesaseteli/employer/pages/company';
import Company from 'kesaseteli/employer/types/company';
import React from 'react';
import { QueryClient } from 'react-query';
import createReactQueryTestClient from 'shared/__tests__/utils/react-query/create-react-query-test-client';
import { screen, waitFor } from 'test-utils';

const waitForPageIsLoaded = async (): Promise<void> => {
  await waitFor(() => {
    expect(
      screen.queryByRole('heading', { name: /hakemus/i })
    ).toBeInTheDocument();
  });
};
const waitForShowingCompanyData = async (company: Company): Promise<void> => {
  await waitForPageIsLoaded();
  expect(screen.queryByText(company.name)).toBeInTheDocument();
  expect(screen.queryByText(company.business_id)).toBeInTheDocument();
  expect(screen.queryByText(company.industry)).toBeInTheDocument();
  expect(screen.queryByText(company.street_address)).toBeInTheDocument();
  expect(screen.queryByText(company.postcode)).toBeInTheDocument();
  expect(screen.queryByText(company.city)).toBeInTheDocument();
};

describe('frontend/kesaseteli/employer/src/pages/companyPage.tsx', () => {
  let queryClient: QueryClient;

  it('should not violate accessibility', async () => {
    const { container } = renderComponent(<CompanyPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  describe('loading data', () => {
    queryClient = createReactQueryTestClient();
    beforeEach(() => {
      queryClient.clear();
    });

    it('Should redirect when unauthorized', async () => {
      expectUnauthorizedReply();
      const spyPush = jest.fn();
      renderPage(CompanyPage, queryClient, { push: spyPush });
      await waitFor(() => expect(spyPush).toHaveBeenCalledWith('/login'));
    });

    it('Should show company data', async () => {
      expectAuthorizedReply();
      const expectedCompany = expectToGetCompanyReply();
      renderPage(CompanyPage, queryClient);
      await waitForShowingCompanyData(expectedCompany);
    });

    it('Should show error', async () => {
      expectAuthorizedReply();
      expectToGetCompanyErrorReply();
      renderPage(CompanyPage, queryClient);
      await screen.findByText(/virhe/i);
    });

    it('Should retry when error', async () => {
      queryClient = createReactQueryTestClient({
        queries: {
          retry: 2,
          retryDelay: 1,
        },
      });
      expectAuthorizedReply();
      expectToGetCompanyErrorReply(2);
      const expectedCompany = expectToGetCompanyReply();
      renderPage(CompanyPage, queryClient);
      await waitForShowingCompanyData(expectedCompany);
    });
  });
});
