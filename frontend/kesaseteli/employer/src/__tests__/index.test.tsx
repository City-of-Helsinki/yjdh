import { axe } from 'jest-axe';
import renderPage from 'kesaseteli/employer/__tests__/utils/components/render-page';
import IndexPage from 'kesaseteli/employer/pages';
import {
  expectAuthorizedReply,
  expectToGetApplicationsErrorFromBackend,
  expectToGetApplicationsFromBackend,
  expectUnauthorizedReply,
} from 'kesaseteli-shared/__tests__/utils/backend/backend-nocks';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import React from 'react';
import FakeObjectFactory from 'shared/__tests__/utils/FakeObjectFactory';
import { screen, waitFor } from 'shared/__tests__/utils/test-utils';
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

  it('Should redirect to login when unauthorized', async () => {
    expectUnauthorizedReply();
    const spyPush = jest.fn();
    renderPage(IndexPage, { push: spyPush });
    await waitFor(
      () =>
        expect(spyPush).toHaveBeenCalledWith(`${DEFAULT_LANGUAGE}/login`, undefined, {
          shallow: false,
        }),
      { timeout: 5000 }
    );
  });

  describe('when authorized', () => {
    it('Should show errorPage when applications loading error', async () => {
      expectAuthorizedReply();
      expectToGetApplicationsErrorFromBackend();
      const spyPush = jest.fn();
      renderPage(IndexPage, { push: spyPush });
      await waitFor(
        () =>
          expect(spyPush).toHaveBeenCalledWith(
            `${DEFAULT_LANGUAGE}/500`,
            undefined,
            { shallow: false }
          ),
        { timeout: 10_000 }
      );
    });

    it('Should render the dashboard when applications exist', async () => {
      const applications = fakeObjectFactory.fakeApplications(2);
      expectAuthorizedReply();
      expectToGetApplicationsFromBackend(applications);

      renderPage(IndexPage);

      await waitFor(() => {
        expect(screen.getByText('Kesäseteli - Työnantajaportaali')).toBeInTheDocument();
      });
      expect(screen.getByText('Aiemmat kesäsetelihakemukset')).toBeInTheDocument();
    });

    it('Should render the dashboard when no applications exist', async () => {
      expectAuthorizedReply();
      expectToGetApplicationsFromBackend([]);

      renderPage(IndexPage);

      await waitFor(() => {
        expect(screen.getByText('Kesäseteli - Työnantajaportaali')).toBeInTheDocument();
      });
      expect(screen.getByText('Ei aiempia hakemuksia.')).toBeInTheDocument();
    });
  });
});
