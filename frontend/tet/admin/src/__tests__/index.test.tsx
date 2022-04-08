import renderComponent from 'tet/admin/__tests__/utils/components/render-component';
import IndexPage from 'tet/admin/pages';
import { axe } from 'jest-axe';
import React from 'react';
import { fakeEventListAdmin } from 'tet-shared/__tests__/utils/fake-objects';
import {
  expectAuthorizedReply,
  expectToGetEventsFromBackend,
  expectUnauthorizedReply,
} from 'tet/admin/__tests__/utils/backend/backend-nocks';
import renderPage from 'tet/admin/__tests__/utils/components/render-page';
import { waitFor } from 'shared/__tests__/utils/test-utils';
import { DEFAULT_LANGUAGE } from 'shared/i18n/i18n';
import { screen } from '@testing-library/react';
import { within } from '@testing-library/dom';

describe('frontend/tet/admin/src/pages/index.tsx', () => {
  const draftTitles = ['draft-1', 'draft-2'];
  const publishedTitles = ['published-1', 'published-2', 'published-3'];
  const events = fakeEventListAdmin(draftTitles, publishedTitles);

  it('should have no accessibility violations', async () => {
    const {
      renderResult: { container },
    } = renderComponent(<IndexPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should redirect when unauthorized', async () => {
    expectUnauthorizedReply();
    const spyPush = jest.fn();
    await renderPage(IndexPage, { push: spyPush });
    await waitFor(() => expect(spyPush).toHaveBeenCalledWith(`${DEFAULT_LANGUAGE}/login`));
  });

  describe('when authorized', () => {
    it('should show TET postings from backend', async () => {
      expectAuthorizedReply();
      expectToGetEventsFromBackend(events);

      await renderPage(IndexPage);

      // copy-pasted from JobPostings.test.tsx
      const publishedList = await screen.findByTestId('published-list');
      const draftList = await screen.findByTestId('draft-list');

      draftTitles.forEach((title) => {
        const postingTitle = within(draftList).getByText(new RegExp(title, 'i'));
        expect(postingTitle).toBeInTheDocument();
      });

      publishedTitles.forEach((title) => {
        const postingTitle = within(publishedList).getByText(new RegExp(title, 'i'));
        expect(postingTitle).toBeInTheDocument();
      });
    });
  });
});
