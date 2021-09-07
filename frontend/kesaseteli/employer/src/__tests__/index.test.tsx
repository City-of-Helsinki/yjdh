import { axe } from 'jest-axe';
import {
  expectAuthorizedReply,
  expectToCreateApplicationErrorFromBackend,
  expectToCreateApplicationToBackend,
  expectToGetApplicationsErrorFromBackend,
  expectToGetApplicationsFromBackend,
  expectUnauthorizedReply,
} from 'kesaseteli/employer/__tests__/utils/backend/backend-nocks';
import renderComponent from 'kesaseteli/employer/__tests__/utils/components/render-component';
import renderPage from 'kesaseteli/employer/__tests__/utils/components/render-page';
import IndexPage from 'kesaseteli/employer/pages';
import React from 'react';
import ErrorPageApi from 'shared/__tests__/component-apis/error-page-api';
import {
  fakeApplication,
  fakeApplications,
} from 'shared/__tests__/utils/fake-objects';
import createReactQueryTestClient from 'shared/__tests__/utils/react-query/create-react-query-test-client';
import { waitFor } from 'shared/__tests__/utils/test-utils';
import { DEFAULT_LANGUAGE, Language } from 'shared/i18n/i18n';

describe('frontend/kesaseteli/employer/src/pages/index.tsx', () => {
  it('test for accessibility violations', async () => {
    const { container } = renderComponent(<IndexPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Should redirect when unauthorized', async () => {
    const queryClient = createReactQueryTestClient();
    expectUnauthorizedReply();
    const spyPush = jest.fn();
    await renderPage(IndexPage, queryClient, { push: spyPush });
    await waitFor(() => expect(spyPush).toHaveBeenCalledWith('/login'));
  });

  describe('when authorized', () => {
    describe('when backend returns error', () => {
      it('Should show errorPage when applications loading error', async () => {
        const queryClient = createReactQueryTestClient();
        expectAuthorizedReply();
        expectToGetApplicationsErrorFromBackend();
        await renderPage(IndexPage, queryClient);
        await ErrorPageApi.expectations.displayErrorPage();
      });
      it('Should show errorPage when applications creation error', async () => {
        const queryClient = createReactQueryTestClient();
        expectAuthorizedReply();
        expectToGetApplicationsFromBackend([]);
        expectToCreateApplicationErrorFromBackend();
        await renderPage(IndexPage, queryClient);
        await ErrorPageApi.expectations.displayErrorPage();
      });
      describe('when clicking reload button', () => {
        it('Should reload the page', async () => {
          const queryClient = createReactQueryTestClient();
          expectAuthorizedReply();
          expectToGetApplicationsErrorFromBackend();
          const locale: Language = 'en';
          const spyReload = jest.fn();
          await renderPage(IndexPage, queryClient, {
            reload: spyReload,
            locale,
          });
          await ErrorPageApi.expectations.displayErrorPage();
          ErrorPageApi.actions.clickToRefreshPage();
          await waitFor(() => expect(spyReload).toHaveBeenCalledTimes(1));
        });
      });
      describe('when clicking Logout button', () => {
        it('Should logout', async () => {
          const queryClient = createReactQueryTestClient();
          expectAuthorizedReply();
          const errorReply = expectToGetApplicationsErrorFromBackend(2);
          const locale: Language = 'en';
          const spyPush = jest.fn();
          await renderPage(IndexPage, queryClient, {
            push: spyPush,
            locale,
          });
          await ErrorPageApi.expectations.displayErrorPage();
          await ErrorPageApi.actions.clickLogoutButton();
          await waitFor(() => {
            expect(queryClient.getQueryData('user')).toBeUndefined();
          });
          expect(spyPush).toHaveBeenCalledWith('/login?logout=true');
          await waitFor(() => errorReply.done());
        });
      });
    });

    describe('when user does not have previous applications', () => {
      it('Should create a new application and redirect to its page', async () => {
        const queryClient = createReactQueryTestClient();
        const newApplication = fakeApplication('123-foo-bar');
        expectAuthorizedReply();
        expectToGetApplicationsFromBackend([]);
        expectToCreateApplicationToBackend(newApplication);
        expectToGetApplicationsFromBackend([newApplication]);
        const locale: Language = 'en';
        const spyPush = jest.fn();
        await renderPage(IndexPage, queryClient, { push: spyPush, locale });
        await waitFor(() => {
          expect(
            queryClient.getQueryData(['applications', newApplication.id])
          ).toEqual(newApplication);
          expect(spyPush).toHaveBeenCalledWith(
            `${locale}/application?id=${newApplication.id}`
          );
        });
      });
    });

    describe('when user has previous applications', () => {
      it('Should redirect to latest application page with default locale', async () => {
        const queryClient = createReactQueryTestClient();
        const applications = fakeApplications(5);
        expectAuthorizedReply();
        expectToGetApplicationsFromBackend(applications);
        const spyPush = jest.fn();
        await renderPage(IndexPage, queryClient, { push: spyPush });
        const [latestApplication] = applications;
        await waitFor(() =>
          expect(spyPush).toHaveBeenCalledWith(
            `${DEFAULT_LANGUAGE}/application?id=${latestApplication.id}`
          )
        );
      });

      it('Should redirect to latest application page with specified locale', async () => {
        const queryClient = createReactQueryTestClient();
        const applications = fakeApplications(5);
        expectAuthorizedReply();
        expectToGetApplicationsFromBackend(applications);
        const locale: Language = 'en';
        const spyPush = jest.fn();
        await renderPage(IndexPage, queryClient, { push: spyPush, locale });
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
