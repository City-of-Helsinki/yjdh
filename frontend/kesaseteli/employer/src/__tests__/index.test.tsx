import { axe } from 'jest-axe';
import IndexPage from 'kesaseteli/employer/pages';
import {
  expectAuthorizedReply,
  expectToCreateApplicationErrorFromBackend,
  expectToCreateApplicationToBackend,
  expectToGetApplicationsErrorFromBackend,
  expectToGetApplicationsFromBackend,
  expectUnauthorizedReply,
} from 'kesaseteli-shared/__tests__/utils/backend/backend-nocks';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import renderPage from 'kesaseteli-shared/__tests__/utils/components/render-page';
import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import React from 'react';
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
        const spyPush = jest.fn();
        await renderPage(IndexPage, { push: spyPush });
        await waitFor(() =>
          expect(spyPush).toHaveBeenCalledWith(`${DEFAULT_LANGUAGE}/500`)
        );
      });
      it('Should show errorPage when applications creation error', async () => {
        expectAuthorizedReply();
        expectToGetApplicationsFromBackend([]);
        expectToCreateApplicationErrorFromBackend();
        const spyPush = jest.fn();
        await renderPage(IndexPage, { push: spyPush });
        await waitFor(() =>
          expect(spyPush).toHaveBeenCalledWith(`${DEFAULT_LANGUAGE}/500`)
        );
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
        });
        expect(spyPush).toHaveBeenCalledWith(
          `${DEFAULT_LANGUAGE}/application?id=${newApplication.id}`
        );
      });
      it('Should create a new application and redirect to its page with router locale', async () => {
        const locale: Language = 'en';
        const newApplication = fakeApplication(
          '123-foo-bar',
          undefined,
          false,
          locale
        );
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
        });
        expect(spyPush).toHaveBeenCalledWith(
          `${locale}/application?id=${newApplication.id}`
        );
      });
    });

    describe('when user has previous applications', () => {
      it("Should redirect to latest application page with application's locale", async () => {
        const application = fakeApplication('my-id', undefined, false, 'sv');
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
