import { axe } from 'jest-axe';
import {
  expectAuthorizedReply,
  expectToCreateApplicationErrorFromBackend,
  expectToCreateApplicationToBackend,
  expectToGetApplicationsErrorFromBackend,
  expectToGetApplicationsFromBackend,
  expectUnauthorizedReply,
} from 'kesaseteli/employer/__tests__/utils/backend/backend-nocks';
import renderPage from 'kesaseteli/employer/__tests__/utils/components/render-page';
import EmployerIndex from 'kesaseteli/employer/pages';
import nock from 'nock';
import React from 'react';
import {
  fakeApplication,
  fakeApplications,
} from 'shared/__tests__/utils/fake-objects';
import createReactQueryTestClient from 'shared/__tests__/utils/react-query/create-react-query-test-client';
import { render, screen, waitFor } from 'shared/__tests__/utils/test-utils';
import { DEFAULT_LANGUAGE, Language } from 'shared/i18n/i18n';
import type Application from 'shared/types/employer-application';

const expectCommonErrorNotification = async (): Promise<void> =>
  waitFor(() =>
    expect(
      screen.getByRole('heading', {
        name: /common_error/i,
      })
    ).toBeInTheDocument()
  );

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
    const { container } = render(<EmployerIndex />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Should redirect when unauthorized', async () => {
    expectUnauthorizedReply();
    const spyPush = jest.fn();
    renderPage(EmployerIndex, queryClient, { push: spyPush });
    await waitFor(() => expect(spyPush).toHaveBeenCalledWith('/login'));
  });

  describe('when authorized', () => {
    beforeEach(() => {
      expectAuthorizedReply();
    });

    describe('when backend returns error', () => {
      it('Should show applicaton loading error', async () => {
        expectToGetApplicationsErrorFromBackend();
        renderPage(EmployerIndex, queryClient);
        await expectCommonErrorNotification();
      });
      it('Should show applicaton creation error', async () => {
        expectToGetApplicationsFromBackend([]);
        expectToCreateApplicationErrorFromBackend();
        renderPage(EmployerIndex, queryClient);
        await expectCommonErrorNotification();
      });
    });

    describe('when user does not have previous applications', () => {
      it('Should create a new application', async () => {
        const newApplication = fakeApplication('123-foo-bar');
        expectToGetApplicationsFromBackend([]);
        expectToCreateApplicationToBackend(newApplication);
        renderPage(EmployerIndex, queryClient);
        await expectToCreateQueryDataForApplication(newApplication);
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
        renderPage(EmployerIndex, queryClient, { push: spyPush });
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
        renderPage(EmployerIndex, queryClient, { push: spyPush, locale });
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
