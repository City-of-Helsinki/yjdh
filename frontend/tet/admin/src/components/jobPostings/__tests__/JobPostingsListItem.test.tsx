import React from 'react';
import { screen, userEvent, within } from 'shared/__tests__/utils/test-utils';
import renderComponent from 'tet/admin/__tests__/utils/components/render-component';
import { fakeTetPosting, getPastDate, getRecentDate } from 'tet-shared/__tests__/utils/fake-objects';
import { furthestUiEndDate } from 'tet-shared/constants/furthest-end-date';

import JobPostingsListItem from '../JobPostingsListItem';

const draft = fakeTetPosting({ title: 'Not published', date_published: null, spots: 3 });
const published = fakeTetPosting({
  title: 'Published',
  org_name: 'published-organization',
  description: 'published-description',
  date_published: getPastDate(),
});

const never_expiring = fakeTetPosting({
  ...published,
  end_date: furthestUiEndDate,
});

const expired = fakeTetPosting({
  start_date: getPastDate(),
  end_date: getRecentDate(),
});

describe('JobPostingsListItem', () => {
  it('should show that posting is published if date_published is not null', async () => {
    renderComponent(<JobPostingsListItem posting={published} sectionId="published" />);

    await screen.findByText(/julkaistu/i);
  });

  it('should show that posting is not published if date_published is null', async () => {
    renderComponent(<JobPostingsListItem posting={draft} sectionId="draft" />);

    await screen.findByText(/ei julkaistu/i);
  });

  it('should show correctly how many tet spots are available', async () => {
    renderComponent(<JobPostingsListItem posting={draft} sectionId="draft" />);

    await screen.findByText(new RegExp(`${draft.spots} TET-paikkaa`, 'i'));
  });

  it('should show correct menu items for the published posting, when menu is open', async () => {
    renderComponent(<JobPostingsListItem posting={published} sectionId="published" />);

    // Expect list to be hidden before click
    expect(screen.queryByRole('list')).not.toBeInTheDocument();

    const menuButton = await screen.findByRole('button');
    await userEvent.click(menuButton);
    const list = screen.getByRole('list');
    expect(within(list).queryByText(/julkaise nyt/i)).not.toBeInTheDocument();
    await within(list).findByText(/muokkaa/i);
    await within(list).findByText(/tee kopio/i);
    await within(list).findByText(/poista/i);
  });

  it('should show correct menu items for the draft posting, when menu is open', async () => {
    renderComponent(<JobPostingsListItem posting={draft} sectionId="draft" />);

    expect(screen.queryByRole('list')).not.toBeInTheDocument();

    const menuButton = await screen.findByRole('button');
    await userEvent.click(menuButton);
    const list = screen.getByRole('list');
    await within(list).findByText(/julkaise nyt/i);
    await within(list).findByText(/muokkaa/i);
    await within(list).findByText(/tee kopio/i);
    await within(list).findByText(/poista/i);
  });

  it('should show correct menu items for the expired posting, when menu is open', async () => {
    renderComponent(<JobPostingsListItem posting={expired} sectionId="expired" />);
    expect(screen.queryByRole('list')).not.toBeInTheDocument();

    const menuButton = await screen.findByRole('button');
    await userEvent.click(menuButton);
    const list = screen.getByRole('list');
    expect(within(list).queryByText(/julkaise nyt/i)).not.toBeInTheDocument();
    expect(within(list).queryByText(/muokkaa/i)).not.toBeInTheDocument();
    await within(list).findByText(/tee kopio/i);
    await within(list).findByText(/poista/i);
  });

  it('it should show title, organization name, description and dates', async () => {
    renderComponent(<JobPostingsListItem posting={published} sectionId="published" />);

    await screen.findByText(new RegExp(`${published.title} - ${published.org_name}`, 'i'));
    await screen.findByText(new RegExp(`${published.description}`, 'i'));
    await screen.findByText(new RegExp(`${published.start_date}-${published.end_date}$`, 'i'), {
      normalizer: (str) => str.replace(/\s/g, ''),
    });
  });

  it('it should hide end date when furthest end date special value used', async () => {
    renderComponent(<JobPostingsListItem posting={never_expiring} sectionId="published" />);
    await screen.findByText(new RegExp(`^${never_expiring.start_date}-$`, 'i'), {
      normalizer: (str) => str.replace(/\s/g, ''),
    });
  });
});
