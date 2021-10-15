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
import { BackendEndpoint } from 'kesaseteli/employer/backend-api/backend-api';
import IndexPage from 'kesaseteli/employer/pages';
import React from 'react';
import ErrorPageApi from 'shared/__tests__/component-apis/error-page-api';
import {
  fakeApplication,
  fakeApplications,
} from 'shared/__tests__/utils/fake-objects';
import { waitFor } from 'shared/__tests__/utils/test-utils';
import { DEFAULT_LANGUAGE, Language } from 'shared/i18n/i18n';

describe('frontend/kesaseteli/employer/src/pages/index.tsx', () => {
  it('test for accessibility violations', async () => {
    const {
      renderResult: { container },
    } = renderComponent(<IndexPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Should redirect when unauthorized', async () => {
    expectUnauthorizedReply();
    const spyPush = jest.fn();
    await renderPage(IndexPage, { push: spyPush });
    await waitFor(() => expect(spyPush).toHaveBeenCalledWith('/login'));
  });

  describe('when authorized', () => {
    describe('when backend returns error', () => {
      it('Should show errorPage when applications loading error', async () => {
        expectAuthorizedReply();
        expectToGetApplicationsErrorFromBackend();
        await renderPage(IndexPage);
        await ErrorPageApi.expectations.displayErrorPage();
      });
      it('Should show errorPage when applications creation error', async () => {
        expectAuthorizedReply();
        expectToGetApplicationsFromBackend([]);
        expectToCreateApplicationErrorFromBackend();
        await renderPage(IndexPage);
        await ErrorPageApi.expectations.displayErrorPage();
      });
      describe('when clicking reload button', () => {
        it('Should reload the page', async () => {
          expectAuthorizedReply();
          expectToGetApplicationsErrorFromBackend();
          const locale: Language = 'en';
          const spyReload = jest.fn();
          await renderPage(IndexPage, {
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
          expectAuthorizedReply();
          const errorReply = expectToGetApplicationsErrorFromBackend(2);
          const locale: Language = 'en';
          const spyPush = jest.fn();
          const queryClient = await renderPage(IndexPage, {
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
      it('Should create a new application and redirect to its page with default language', async () => {
        const newApplication = fakeApplication('123-foo-bar');
        expectAuthorizedReply();
        expectToGetApplicationsFromBackend([]);
        expectToCreateApplicationToBackend(newApplication);
        const spyPush = jest.fn();
        const queryClient = await renderPage(IndexPage, { push: spyPush });
        await waitFor(() => {
          expect(
            queryClient.getQueryData(
              `${BackendEndpoint.APPLICATIONS}${newApplication?.id}/`
            )
          ).toEqual(newApplication);
          expect(spyPush).toHaveBeenCalledWith(
            `${DEFAULT_LANGUAGE}/application?id=${newApplication.id}`
          );
        });
      });
      it('Should create a new application and redirect to its page with router locale', async () => {
        const locale: Language = 'en';
        const newApplication = fakeApplication('123-foo-bar', false, locale);
        expectAuthorizedReply();
        expectToGetApplicationsFromBackend([]);
        expectToCreateApplicationToBackend(newApplication);
        const spyPush = jest.fn();
        const queryClient = await renderPage(IndexPage, {
          push: spyPush,
          defaultLocale: locale,
        });
        await waitFor(() => {
          expect(
            queryClient.getQueryData(
              `${BackendEndpoint.APPLICATIONS}${newApplication?.id}/`
            )
          ).toEqual(newApplication);
          expect(spyPush).toHaveBeenCalledWith(
            `${locale}/application?id=${newApplication.id}`
          );
        });
      });
    });

    describe('when user has previous applications', () => {
      it("Should redirect to latest application page with application's locale", async () => {
        const application = fakeApplication('my-id', false, 'sv');
        const applications = [application, ...fakeApplications(4)];
        expectAuthorizedReply();
        expectToGetApplicationsFromBackend(applications);
        const locale: Language = 'en';
        const spyPush = jest.fn();
        await renderPage(IndexPage, {
          push: spyPush,
          defaultLocale: locale,
        });
        await waitFor(() =>
          expect(spyPush).toHaveBeenCalledWith(`sv/application?id=my-id`)
        );
      });
    });
  });
});
