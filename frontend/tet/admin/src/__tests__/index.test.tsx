import renderComponent from 'tet/admin/__tests__/utils/components/render-component';
import IndexPage from 'tet/admin/pages';
import { axe } from 'jest-axe';
import React from 'react';
import { fakeEventListAdmin } from 'tet-shared/__tests__/utils/fake-objects';
import { expectAuthorizedReply, expectToGetEventsFromBackend } from 'tet/admin/__tests__/utils/backend/backend-nocks';
import getIndexPageApi from 'tet/admin/__tests__/utils/components/get-index-page-api';
import renderPage from 'tet/admin/__tests__/utils/components/render-page';
import { waitFor } from 'shared/__tests__/utils/test-utils';
import JobPostings from 'tet/admin/components/jobPostings/JobPostings';

describe('frontend/tet/admin/src/pages/index.tsx', () => {
  const draftTitles = ['draft-1', 'draft-2'];
  const publishedTitles = ['published-1', 'published-2', 'published-3'];
  const events = fakeEventListAdmin(draftTitles, publishedTitles);

  it('test', async () => {
    //expectToGetEventsFromBackend(events);
    //await renderPage(IndexPage);
  });
});
