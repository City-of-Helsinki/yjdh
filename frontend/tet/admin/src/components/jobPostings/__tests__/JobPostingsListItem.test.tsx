import { screen } from '@testing-library/react';
import renderComponent from 'tet/admin/__tests__/utils/components/render-component';
import React from 'react';
import { fakeTetPosting, getPastDate } from 'tet-shared/__tests__/utils/fake-objects';
import JobPostingsListItem from '../JobPostingsListItem';
import { within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

const notPublished = fakeTetPosting({ title: 'Not published', date_published: null, spots: 3 });
const published = fakeTetPosting({
  title: 'Published',
  org_name: 'published-organization',
  description: 'published-description',
  date_published: getPastDate(),
});

describe('JobPostingsListItem', () => {
  it('should show that posting is published if date_published is not null', async () => {
    renderComponent(<JobPostingsListItem posting={published} />);

    await screen.findByText(/Julkaistu/i);
  });

  it('should show that posting is not published if date_published is null', async () => {
    renderComponent(<JobPostingsListItem posting={notPublished} />);

    await screen.findByText(/ei julkaistu/i);
  });

  it('should show correctly how many tet spots are available', async () => {
    renderComponent(<JobPostingsListItem posting={notPublished} />);

    await screen.findByText(new RegExp(`${notPublished.spots} TET-paikkaa`, 'i'));
  });

  it('should show correct menu items for the published posting, when menu is open', async () => {
    renderComponent(<JobPostingsListItem posting={published} />);

    //Expect list to be hidden before click
    expect(screen.queryByRole('list')).toBeNull();

    const menuButton = await screen.findByRole('button');
    userEvent.click(menuButton);
    const list = screen.getByRole('list');
    expect(within(list).queryByText(/julkaise nyt/i)).toBeNull();
    await within(list).findByText(/muokkaa/i);
    await within(list).findByText(/tee kopio/i);
    await within(list).findByText(/poista/i);
  });

  it('should show correct menu items for the not published posting, when menu is open', async () => {
    renderComponent(<JobPostingsListItem posting={notPublished} />);

    expect(screen.queryByRole('list')).toBeNull();

    const menuButton = await screen.findByRole('button');
    userEvent.click(menuButton);
    const list = screen.getByRole('list');
    await within(list).findByText(/julkaise nyt/i);
    await within(list).findByText(/muokkaa/i);
    await within(list).findByText(/tee kopio/i);
    await within(list).findByText(/poista/i);
  });

  it('it should show title, organization name and description', async () => {
    renderComponent(<JobPostingsListItem posting={published} />);

    await screen.findByText(new RegExp(`${published.title} - ${published.org_name}`, 'i'));
    await screen.findByText(new RegExp(`${published.description}`, 'i'));
  });
});
