import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import renderPage from 'kesaseteli/employer/__tests__/utils/components/render-page';
import IndexPage from 'kesaseteli/employer/pages';
import {
  expectAuthorizedReply,
  expectToGetApplicationsErrorFromBackend,
  expectToGetCompanyFromBackend,
  expectUnauthorizedReply,
} from 'kesaseteli-shared/__tests__/utils/backend/backend-nocks';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import { getBackendDomain } from 'kesaseteli-shared/backend-api/backend-api';
import nock from 'nock';
import React from 'react';
import FakeObjectFactory from 'shared/__tests__/utils/FakeObjectFactory';
import { screen, waitFor } from 'shared/__tests__/utils/test-utils';
import { DEFAULT_LANGUAGE } from 'shared/i18n/i18n';
import Application from 'shared/types/application';

const fakeObjectFactory = new FakeObjectFactory();

const mockGetApplications = (
  applications: Application[],
  year?: string
): void => {
  nock(getBackendDomain())
    .get('/v1/employerapplications/')
    .query((actualQuery) => {
      const query = actualQuery || {};
      const matchesOnlyMine =
        query.only_mine === 'false' || query.only_mine === 'true';
      const matchesYear = year
        ? query.created_at__year === year
        : !query.created_at__year;
      return matchesOnlyMine && matchesYear;
    })
    .reply(
      200,
      (uri) => {
        const queryParams = new URLSearchParams(uri.split('?')[1] || '');
        if (queryParams.has('limit')) {
          return {
            count: applications.length,
            next: null,
            previous: null,
            results: applications,
          };
        }
        return applications;
      },
      { 'Access-Control-Allow-Origin': '*' }
    );
};

describe('frontend/kesaseteli/employer/src/pages/index.tsx', () => {
  it('test for accessibility violations', async () => {
    const {
      renderResult: { container },
    } = renderComponent(<IndexPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Should redirect to login when unauthorized', async () => {
    expectUnauthorizedReply();
    const spyPush = jest.fn();
    renderPage(IndexPage, { push: spyPush });
    await waitFor(
      () =>
        expect(spyPush).toHaveBeenCalledWith(
          `/${DEFAULT_LANGUAGE}/login`,
          undefined,
          {
            shallow: false,
          }
        ),
      { timeout: 5000 }
    );
  });

  describe('when authorized', () => {
    it('Should show errorPage when applications loading error', async () => {
      expectAuthorizedReply();
      expectToGetCompanyFromBackend();
      expectToGetApplicationsErrorFromBackend();
      const spyPush = jest.fn();
      renderPage(IndexPage, { push: spyPush });
      await waitFor(
        () =>
          expect(spyPush).toHaveBeenCalledWith(
            `/${DEFAULT_LANGUAGE}/500`,
            undefined,
            { shallow: false }
          ),
        { timeout: 10_000 }
      );
    });

    it('Should render the dashboard when applications exist', async () => {
      const applications = fakeObjectFactory.fakeApplications(2);
      expectAuthorizedReply();
      expectToGetCompanyFromBackend();
      mockGetApplications(applications);
      mockGetApplications(applications, new Date().getFullYear().toString());

      renderPage(IndexPage);

      await waitFor(() => {
        expect(
          screen.getByText(
            applications[0].summer_vouchers[0].employee_name ?? ''
          )
        ).toBeInTheDocument();
      });
      expect(
        screen.getByRole('heading', {
          name: 'Työnantajan kesäsetelihakemukset',
        })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { name: 'Aiemmat kesäsetelihakemukset' })
      ).toBeInTheDocument();
    });

    it('Should render the dashboard when no applications exist', async () => {
      expectAuthorizedReply();
      expectToGetCompanyFromBackend();
      mockGetApplications([]);
      mockGetApplications([], new Date().getFullYear().toString());

      renderPage(IndexPage);

      await waitFor(() => {
        expect(screen.getByText('Ei aiempia hakemuksia.')).toBeInTheDocument();
      });
      expect(
        screen.getByRole('heading', {
          name: 'Työnantajan kesäsetelihakemukset',
        })
      ).toBeInTheDocument();
    });

    it('Should render the organisation name from the company endpoint', async () => {
      expectAuthorizedReply();
      expectToGetCompanyFromBackend({ name: 'Firma Oy' });
      mockGetApplications([]);
      mockGetApplications([], new Date().getFullYear().toString());

      renderPage(IndexPage);

      await waitFor(() => {
        expect(
          screen.getByText('Asioit organisaation Firma Oy puolesta.')
        ).toBeInTheDocument();
      });
    });

    it("Should only identify the current user's draft when multiple drafts exist", async () => {
      const myId = 'my-user-id';
      const myUser = { ...fakeObjectFactory.fakeUser(), id: myId };
      const myDraft = {
        ...fakeObjectFactory.fakeApplication(),
        status: 'draft',
        is_mine: true,
      } as Application;
      const otherDraft = {
        ...fakeObjectFactory.fakeApplication(),
        status: 'draft',
        is_mine: false,
      } as Application;
      const applications = [otherDraft, myDraft]; // otherDraft is first

      expectAuthorizedReply(myUser);
      expectToGetCompanyFromBackend();
      mockGetApplications(applications);
      mockGetApplications(applications, new Date().getFullYear().toString());

      const spyPush = jest.fn();
      renderPage(IndexPage, { push: spyPush });

      // Wait for the dashboard to render
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /tee uusi hakemus/i })
        ).toBeInTheDocument();
      });

      // Click the button
      const button = screen.getByRole('button', { name: /tee uusi hakemus/i });
      button.click();

      // Verify it redirects to MY draft, not the first one (otherDraft)
      await waitFor(() => {
        expect(spyPush).toHaveBeenCalledWith(
          expect.stringContaining(`application?id=${myDraft.id}`)
        );
      });
      expect(spyPush).not.toHaveBeenCalledWith(
        expect.stringContaining(`application?id=${otherDraft.id}`)
      );
    });

    it('Should allow filtering applications by year', async () => {
      const currentYear = new Date().getFullYear().toString();
      const pastYear = (new Date().getFullYear() - 1).toString();

      const myAppCurrentYear = {
        ...fakeObjectFactory.fakeApplication(),
        submitted_at: `${currentYear}-06-01`,
        status: 'submitted',
        is_mine: true,
      } as Application;
      myAppCurrentYear.summer_vouchers[0].employee_name =
        'Current Year Employee';

      const myAppPastYear = {
        ...fakeObjectFactory.fakeApplication(),
        submitted_at: `${pastYear}-06-01`,
        status: 'submitted',
        is_mine: true,
      } as Application;
      myAppPastYear.summer_vouchers[0].employee_name = 'Past Year Employee';

      const applications = [myAppCurrentYear, myAppPastYear];

      expectAuthorizedReply();
      expectToGetCompanyFromBackend();
      mockGetApplications(applications);
      mockGetApplications(applications);
      mockGetApplications([myAppCurrentYear], currentYear);
      mockGetApplications([myAppPastYear], pastYear);

      renderPage(IndexPage);

      const user = userEvent.setup();

      // Should default to current year, displaying only the current year application
      await waitFor(() => {
        expect(screen.getByText('Current Year Employee')).toBeInTheDocument();
      });
      expect(screen.queryByText('Past Year Employee')).not.toBeInTheDocument();

      // Open the year dropdown
      const combobox = screen.getByRole('combobox');
      await user.click(combobox);

      // Select the past year
      const pastOption = await screen.findByRole('option', { name: pastYear });
      await user.click(pastOption);

      // Wait for table to update and show only the past year application
      await waitFor(() => {
        expect(screen.getByText('Past Year Employee')).toBeInTheDocument();
      });
      expect(
        screen.queryByText('Current Year Employee')
      ).not.toBeInTheDocument();

      // Select "All years"
      await user.click(combobox);
      const allOptions = await screen.findAllByRole('option');
      const allOption = allOptions[0];
      await user.click(allOption);

      // Wait for table to update and show both applications
      await waitFor(() => {
        expect(screen.getByText('Current Year Employee')).toBeInTheDocument();
      });
      expect(screen.getByText('Past Year Employee')).toBeInTheDocument();
    });
  });
});
