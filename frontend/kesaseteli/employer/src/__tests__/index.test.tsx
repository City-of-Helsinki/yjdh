import { axe } from 'jest-axe';
import renderPage from 'kesaseteli/employer/__tests__/utils/components/render-page';
import IndexPage from 'kesaseteli/employer/pages';
import {
  expectAuthorizedReply,
  expectToCreateApplicationToBackend,
  expectToGetApplicationsErrorFromBackend,
  expectToGetApplicationsFromBackend,
  expectUnauthorizedReply,
} from 'kesaseteli-shared/__tests__/utils/backend/backend-nocks';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import React from 'react';
import FakeObjectFactory from 'shared/__tests__/utils/FakeObjectFactory';
import { waitFor } from 'shared/__tests__/utils/test-utils';
import { DEFAULT_LANGUAGE } from 'shared/i18n/i18n';

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
      expect(spyPush).toHaveBeenCalledWith(
        `${DEFAULT_LANGUAGE}/login?sessionExpired=true`,
        undefined,
        { shallow: false }
      )
    );
  });

  describe('when authorized', () => {
    it('Should show errorPage when applications loading error', async () => {
      expectAuthorizedReply();
      expectToGetApplicationsErrorFromBackend();
      const spyPush = jest.fn();
      renderPage(IndexPage, { push: spyPush });
      await waitFor(() =>
        expect(spyPush).toHaveBeenCalledWith(
          `${DEFAULT_LANGUAGE}/500`,
          undefined,
          { shallow: false }
        )
      );
    });

    it('Should redirect to the first draft application if it exists', async () => {
      const applications = fakeObjectFactory.fakeApplications(2);
      applications[0].status = 'draft';
      expectAuthorizedReply();
      expectToGetApplicationsFromBackend(applications);

      const spyPush = jest.fn();
      renderPage(IndexPage, { push: spyPush });

      await waitFor(() => {
        expect(spyPush).toHaveBeenCalledWith(
          `${DEFAULT_LANGUAGE}/application?id=${applications[0].id}`
        );
      });
    });

    it('Should create a new application and redirect to it if no draft exists', async () => {
      expectAuthorizedReply();
      expectToGetApplicationsFromBackend([]);

      const newApplication = fakeObjectFactory.fakeApplication();
      expectToCreateApplicationToBackend(newApplication);
      // After creation, the application list is invalidated and refetched.
      // We need to mock this second fetch to return the new application so the redirect logic can find it.
      expectToGetApplicationsFromBackend([newApplication]);

      const spyPush = jest.fn();
      renderPage(IndexPage, { push: spyPush });

      await waitFor(() => {
        expect(spyPush).toHaveBeenCalledWith(
          `${DEFAULT_LANGUAGE}/application?id=${newApplication.id}`
        );
      });
    });
  });
});
