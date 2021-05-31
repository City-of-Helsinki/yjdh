import { screen, waitFor } from '@testing-library/react';
import { axe } from 'jest-axe';
import {
  expectAuthorized,
  expectUnauthorized,
} from 'kesaseteli/employer/__tests__/utils/auth-utils';
import endpoint from 'kesaseteli/employer/backend-api/backend-endpoints';
import getBackendUrl from 'kesaseteli/employer/backend-api/backend-url';
import withAuth from 'kesaseteli/employer/components/withAuth';
import CompanyPage from 'kesaseteli/employer/pages/company';
import Company from 'kesaseteli/employer/types/company';
import nock from 'nock';
import React from 'react';
import { QueryClient } from 'react-query';

import {
  createQueryClient,
  renderComponent,
  renderPage,
} from './utils/react-query-utils';

const expectedCompany: Company = {
  id: 'id',
  name: 'Acme Oy',
  business_id: '0877830-0',
  industry: 'Taloustavaroiden vähittäiskauppa',
  street_address: 'Vasaratie 4 A 3',
  postcode: '65350',
  city: 'Vaasa',
};

const expectToReplyOk = (): nock.Scope =>
  nock(getBackendUrl())
    .get(endpoint.COMPANY)
    .reply(200, expectedCompany, { 'Access-Control-Allow-Origin': '*' });

const expectToReplyError = (times = 1): nock.Scope =>
  nock(getBackendUrl())
    .get(endpoint.COMPANY)
    .times(times)
    .replyWithError('This is a test error. Please ignore this error message.');

const waitForPageIsLoaded = (): Promise<HTMLElement> =>
  screen.findByRole('heading', { name: /hakemus/i });

const waitForShowingCompanyData = async (
  company: Company = expectedCompany
): Promise<void> => {
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
    queryClient = createQueryClient();
    beforeEach(() => {
      queryClient.clear();
    });

    it('Should redirect when unauthorized', async () => {
      expectUnauthorized();
      const spyPush = jest.fn();
      renderPage(withAuth(CompanyPage), queryClient, { push: spyPush });
      await waitFor(() => expect(spyPush).toHaveBeenCalledWith('/login'));
    });

    it('Should show company data', async () => {
      expectAuthorized();
      expectToReplyOk();
      renderPage(withAuth(CompanyPage), queryClient);
      await waitForShowingCompanyData();
    });

    it('Should show error', async () => {
      expectAuthorized();
      expectToReplyError();
      renderPage(withAuth(CompanyPage), queryClient);
      await screen.findByText(/virhe/i);
    });

    it('Should retry when error', async () => {
      queryClient = createQueryClient({
        queries: {
          retry: 2,
          retryDelay: 1,
        },
      });
      expectAuthorized();
      expectToReplyError(2);
      expectToReplyOk();
      renderPage(withAuth(CompanyPage), queryClient);
      await waitForShowingCompanyData();
    });
  });
});
