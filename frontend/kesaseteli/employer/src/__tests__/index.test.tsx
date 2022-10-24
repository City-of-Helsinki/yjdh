import { axe } from 'jest-axe';
import renderComponent from 'kesaseteli/employer/__tests__/utils/components/render-component';
import renderPage from 'kesaseteli/employer/__tests__/utils/components/render-page';
import IndexPage from 'kesaseteli/employer/pages';
import {
  expectAuthorizedReply,
  expectToCreateApplicationErrorFromBackend,
  expectToCreateApplicationToBackend,
  expectToGetApplicationsErrorFromBackend,
  expectToGetApplicationsFromBackend,
  expectUnauthorizedReply,
} from 'kesaseteli-shared/__tests__/utils/backend/backend-nocks';
import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import React from 'react';
import { waitForBackendRequestsToComplete } from 'shared/__tests__/utils/component.utils';
import FakeObjectFactory from 'shared/__tests__/utils/FakeObjectFactory';
import { waitFor } from 'shared/__tests__/utils/test-utils';
import { DEFAULT_LANGUAGE, Language } from 'shared/i18n/i18n';

const fakeObjectFactory = new FakeObjectFactory();

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
    renderPage(IndexPage, { push: spyPush });
    await waitFor(() =>
      expect(spyPush).toHaveBeenCalledWith(`${DEFAULT_LANGUAGE}/login`)
    );
  });

  describe('when authorized', () => {
    describe('when backend returns error', () => {
      it('Should show errorPage when applications loading error', async () => {
        expectAuthorizedReply();
        expectToGetApplicationsErrorFromBackend();
        const spyPush = jest.fn();
        renderPage(IndexPage, { push: spyPush });
        await waitFor(() =>
          expect(spyPush).toHaveBeenCalledWith(`${DEFAULT_LANGUAGE}/500`)
        );
      });
      it('Should show errorPage when applications creation error', async () => {
        expectAuthorizedReply();
        expectToGetApplicationsFromBackend([]);
        expectToCreateApplicationErrorFromBackend();
        const spyPush = jest.fn();
        renderPage(IndexPage, { push: spyPush });
        await waitFor(() =>
          expect(spyPush).toHaveBeenCalledWith(`${DEFAULT_LANGUAGE}/500`)
        );
      });
    });

    describe('when user does not have previous applications', () => {
      it('Should create a new application and redirect to its page with default language', async () => {
        const newApplication = fakeObjectFactory.fakeApplication();
        expectAuthorizedReply();
        expectToGetApplicationsFromBackend([]);
        expectToCreateApplicationToBackend(newApplication);
        const spyPush = jest.fn();
        const queryClient = renderPage(IndexPage, { push: spyPush });
        await waitForBackendRequestsToComplete();
        await waitFor(() => {
          expect(
            queryClient.getQueryData(
              `${BackendEndpoint.EMPLOYER_APPLICATIONS}${newApplication?.id}/`
            )
          ).toEqual(newApplication);
        });
        expect(spyPush).toHaveBeenCalledWith(
          `${DEFAULT_LANGUAGE}/application?id=${newApplication.id}`
        );
      });
      it('Should create a new application and redirect to its page with router locale', async () => {
        const locale: Language = 'en';
        const newApplication = fakeObjectFactory.fakeApplication(
          undefined,
          locale
        );
        expectAuthorizedReply();
        expectToGetApplicationsFromBackend([]);
        expectToCreateApplicationToBackend(newApplication);
        const spyPush = jest.fn();
        const queryClient = renderPage(IndexPage, {
          push: spyPush,
          defaultLocale: locale,
        });
        await waitForBackendRequestsToComplete();
        await waitFor(() => {
          expect(
            queryClient.getQueryData(
              `${BackendEndpoint.EMPLOYER_APPLICATIONS}${newApplication?.id}/`
            )
          ).toEqual(newApplication);
        });
        expect(spyPush).toHaveBeenCalledWith(
          `${locale}/application?id=${newApplication.id}`
        );
      });
    });

    describe('when user has previous applications', () => {
      it("Should redirect to latest application page with application's locale", async () => {
        const application = fakeObjectFactory.fakeApplication(undefined, 'sv');
        const { id } = application;
        const applications = [
          application,
          ...fakeObjectFactory.fakeApplications(4),
        ];
        expectAuthorizedReply();
        expectToGetApplicationsFromBackend(applications);
        const locale: Language = 'en';
        const spyPush = jest.fn();
        renderPage(IndexPage, {
          push: spyPush,
          defaultLocale: locale,
        });
        await waitForBackendRequestsToComplete();
        await waitFor(() =>
          expect(spyPush).toHaveBeenCalledWith(`sv/application?id=${id}`)
        );
      });
    });
  });
});
