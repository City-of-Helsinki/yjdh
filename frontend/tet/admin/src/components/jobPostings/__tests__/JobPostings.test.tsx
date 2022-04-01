import { render, screen } from '@testing-library/react';
import { within } from '@testing-library/dom';
import renderComponent from 'tet/admin/__tests__/utils/components/render-component';
import React from 'react';
import { fakeEventListAdmin } from 'tet-shared/__tests__/utils/mockDataUtils';
import { expectToGetEventsFromBackend } from 'tet/admin/__tests__/utils/backend/backend-nocks';

import JobPostings from '../JobPostings';

describe('JobPostings', () => {
  const draftTitles = ['draft-1', 'draft-2'];
  const publishedTitles = ['published-1', 'published-2', 'published-3'];
  const events = fakeEventListAdmin(draftTitles, publishedTitles);

  it('should list unpublished postings in unpublished list and published postings in published list', async () => {
    expectToGetEventsFromBackend(events);
    renderComponent(<JobPostings />);

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

  it('should show correct postings total number in the lists', async () => {
    expectToGetEventsFromBackend(events);
    renderComponent(<JobPostings />);

    const publishedList = await screen.findByTestId('published-list');
    const draftList = await screen.findByTestId('draft-list');

    expect(within(draftList).getByText(new RegExp(`${draftTitles.length} kpl`, 'i'))).toBeInTheDocument();
    expect(within(publishedList).getByText(new RegExp(`${publishedTitles.length} kpl`, 'i'))).toBeInTheDocument();
  });
});
