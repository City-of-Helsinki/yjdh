import { screen } from '@testing-library/react';
import renderComponent from 'tet/admin/__tests__/utils/components/render-component';
import React from 'react';
import { fakeTetPosting, getPastDate } from 'tet-shared/__tests__/utils/mockDataUtils';
import JobPostingsListItem from '../JobPostingsListItem';

const notPublished = fakeTetPosting({ title: 'Not published', date_published: null, spots: 3 });
const published = fakeTetPosting({ title: 'Published', date_published: getPastDate() });

describe('JobPostingsListItem', () => {
  it('should show that posting is published if date_published is not null', async () => {
    renderComponent(<JobPostingsListItem posting={published} />);

    const notPublishedText = screen.getByText(/Julkaistu/i);
    expect(notPublishedText).toBeInTheDocument();
  });

  it('should show that posting is not published if date_published is null', async () => {
    renderComponent(<JobPostingsListItem posting={notPublished} />);

    const notPublishedText = screen.getByText(/ei julkaistu/i);
    expect(notPublishedText).toBeInTheDocument();
  });

  it('should show correctly how many tet spots are available', async () => {
    renderComponent(<JobPostingsListItem posting={notPublished} />);

    expect(screen.getByText(new RegExp(`${notPublished.spots} TET-paikkaa`, 'i'))).toBeInTheDocument();
  });
});
