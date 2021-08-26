import { axe } from 'jest-axe';
import {
  expectAuthorizedReply,
  expectToCreateApplicationErrorFromBackend,
  expectToCreateApplicationToBackend,
  expectToGetApplicationsErrorFromBackend,
  expectToGetApplicationsFromBackend,
  expectToLogout,
  expectUnauthorizedReply,
} from 'kesaseteli/employer/__tests__/utils/backend/backend-nocks';
import renderComponent from 'kesaseteli/employer/__tests__/utils/components/render-component';
import renderPage from 'kesaseteli/employer/__tests__/utils/components/render-page';
import IndexPage from 'kesaseteli/employer/pages';
import nock from 'nock';
import React from 'react';
import getErrorPageApi from 'shared/__tests__/component-apis/get-error-page-api';
import {
  fakeApplication,
  fakeApplications,
} from 'shared/__tests__/utils/fake-objects';
import createReactQueryTestClient from 'shared/__tests__/utils/react-query/create-react-query-test-client';
import { waitFor } from 'shared/__tests__/utils/test-utils';
import { DEFAULT_LANGUAGE, Language } from 'shared/i18n/i18n';
import type Application from 'shared/types/employer-application';

describe('frontend/kesaseteli/employer/src/pages/index.tsx', () => {
  const queryClient = createReactQueryTestClient();
  beforeEach(() => {
    queryClient.clear();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  const expectToCreateQueryDataForApplication = async (
    application: Application
  ): Promise<void> =>
    waitFor(() =>
      expect(
        queryClient.getQueryData(['applications', application.id])
      ).toEqual(application)
    );

  it('test for accessibility violations', async () => {
    const { container } = renderComponent(<IndexPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Should redirect when unauthorized', async () => {
    expectUnauthorizedReply();
    const spyPush = jest.fn();
    renderPage(IndexPage, queryClient, { push: spyPush });
    await waitFor(() => expect(spyPush).toHaveBeenCalledWith('/login'));
  });

  describe('when authorized', () => {
    beforeEach(() => {
      expectAuthorizedReply();
    });

    describe('when backend returns error', () => {
      it('Should show errorPage when applications loading error', async () => {
        const errorPage = getErrorPageApi(
          expectToGetApplicationsErrorFromBackend()
        );
        renderPage(IndexPage, queryClient);
        await errorPage.expectations.displayErrorPage();
      });
      it('Should show errorPage when applications creation error', async () => {
        const errorPage = getErrorPageApi(
          expectToGetApplicationsFromBackend([]),
          expectToCreateApplicationErrorFromBackend()
        );
        renderPage(IndexPage, queryClient);
        await errorPage.expectations.displayErrorPage();
      });
      describe('when clicking reload button', () => {
        it('Should reload the page', async () => {
          const errorPage = getErrorPageApi(
            expectToGetApplicationsErrorFromBackend()
          );
          const locale: Language = 'en';
          const spyReload = jest.fn();
          renderPage(IndexPage, queryClient, {
            reload: spyReload,
            locale,
          });
          await errorPage.expectations.displayErrorPage();
          errorPage.actions.clickToRefreshPage();
          await waitFor(() => expect(spyReload).toHaveBeenCalledTimes(1));
        });
      });
      describe('when clicking Logout button', () => {
        it('Should logout', async () => {
          const errorPage = getErrorPageApi(
            expectToGetApplicationsErrorFromBackend()
          );
          const locale: Language = 'en';
          const spyPush = jest.fn();
          renderPage(IndexPage, queryClient, {
            push: spyPush,
            locale,
          });
          await errorPage.expectations.displayErrorPage();
          errorPage.actions.clickLogoutButton(expectToLogout());
          await errorPage.expectations.allApiRequestsDone();
          await waitFor(() =>
            expect(queryClient.getQueryData('user')).toBeUndefined()
          );
          expect(spyPush).toHaveBeenCalledWith('/login?logout=true');
        });
      });
    });

    describe('when user does not have previous applications', () => {
      it('Should create a new application and redirect to its page', async () => {
        const newApplication = fakeApplication('123-foo-bar');
        expectToGetApplicationsFromBackend([]);
        expectToCreateApplicationToBackend(newApplication);
        const locale: Language = 'en';
        const spyPush = jest.fn();
        renderPage(IndexPage, queryClient, { push: spyPush, locale });
        await expectToCreateQueryDataForApplication(newApplication);
        await waitFor(() =>
          expect(spyPush).toHaveBeenCalledWith(
            `${locale}/application?id=${newApplication.id}`
          )
        );
      });
    });

    describe('when user has previous applications', () => {
      let applications: Application[];
      beforeEach(() => {
        applications = fakeApplications(5);
      });

      it('Should redirect to latest application page with default locale', async () => {
        expectToGetApplicationsFromBackend(applications);
        const spyPush = jest.fn();
        renderPage(IndexPage, queryClient, { push: spyPush });
        const [latestApplication] = applications;
        await waitFor(() =>
          expect(spyPush).toHaveBeenCalledWith(
            `${DEFAULT_LANGUAGE}/application?id=${latestApplication.id}`
          )
        );
      });

      it('Should redirect to latest application page with specified locale', async () => {
        expectToGetApplicationsFromBackend(applications);
        const locale: Language = 'en';
        const spyPush = jest.fn();
        renderPage(IndexPage, queryClient, { push: spyPush, locale });
        const [firstApplication] = applications;
        await waitFor(() =>
          expect(spyPush).toHaveBeenCalledWith(
            `${locale}/application?id=${firstApplication.id}`
          )
        );
      });
    });
  });
});
