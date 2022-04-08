// eslint-disable-next-line import/no-extraneous-dependencies
import { within } from '@testing-library/dom';
import { screen } from '@testing-library/react';
import React from 'react';
import {
  expectAttributesFromLinkedEvents,
  expectToGetEventsFromBackend,
  expectWorkingMethodsFromLinkedEvents,
} from 'tet/admin/__tests__/utils/backend/backend-nocks';
import renderComponent from 'tet/admin/__tests__/utils/components/render-component';
import { fakeEventListAdmin } from 'tet-shared/__tests__/utils/fake-objects';

import JobPostings from '../JobPostings';

describe('JobPostings', () => {
  const draftTitles = ['draft-1', 'draft-2'];
  const publishedTitles = ['published-1', 'published-2', 'published-3'];
  const events = fakeEventListAdmin(draftTitles, publishedTitles);

  it('should list unpublished postings in unpublished list and published postings in published list', async () => {
    expectToGetEventsFromBackend(events);
    expectWorkingMethodsFromLinkedEvents();
    expectAttributesFromLinkedEvents();

    renderComponent(<JobPostings />);

    const publishedList = await screen.findByTestId('published-list');
    const draftList = await screen.findByTestId('draft-list');

    for (const title of draftTitles) {
      await within(draftList).findByText(new RegExp(title, 'i'));
    }

    for (const title of publishedTitles) {
      await within(publishedList).findByText(new RegExp(title, 'i'));
    }
  });

  it('should show correct postings total number in the lists', async () => {
    expectToGetEventsFromBackend(events);
    expectWorkingMethodsFromLinkedEvents();
    expectAttributesFromLinkedEvents();

    renderComponent(<JobPostings />);

    const publishedList = await screen.findByTestId('published-list');
    const draftList = await screen.findByTestId('draft-list');

    await within(draftList).findByText(new RegExp(`${draftTitles.length} kpl`, 'i'));
    await within(publishedList).findByText(new RegExp(`${publishedTitles.length} kpl`, 'i'));
  });
});
