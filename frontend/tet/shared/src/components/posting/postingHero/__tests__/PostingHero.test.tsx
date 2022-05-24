import { containsRegexp } from '@frontend/shared/src/__tests__/utils/translation-utils';
import { render, screen } from '@testing-library/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import React from 'react';
import theme from 'shared/styles/theme';
import { ThemeProvider } from 'styled-components';
import {
  fakeLocation,
  fakeTetPosting,
} from 'tet-shared/__tests__/utils/fake-objects';
import TetPosting from 'tet-shared/types/tetposting';

import PostingHero from '../PostingHero';

type Props = {
  posting: TetPosting;
  showBackButton: boolean;
};

const location = fakeLocation({
  name: 'Harjoittelu',
  city: 'Helsinki',
  street_address: 'Siltasaarenkatu 18',
  postal_code: '00530',
});

const testPosting = {
  title: 'Test title',
  org_name: 'Test organization',
  spots: 4,
  start_date: '3.5.2022',
  end_date: '10.5.2022',
  contact_first_name: 'Etunimi',
  contact_last_name: 'Sukunimi',
  contact_phone: '0455548885',
  contact_email: 'tester@mail.com',
  location,
};

const renderComponent = (props?: Partial<Props>): ReturnType<typeof render> =>
  render(
    <ThemeProvider theme={theme}>
      <PostingHero
        posting={fakeTetPosting(testPosting)}
        showBackButton={false}
        {...props}
      />
    </ThemeProvider>
  );

test('should render title, organization name ', async () => {
  renderComponent();
  await screen.findByRole('heading', { name: testPosting.title });
  await screen.findByRole('heading', { name: testPosting.org_name });
});

test('should render date, spots and contact information', async () => {
  renderComponent();
  await screen.findByText(
    containsRegexp(
      `${location.name}, ${location.street_address}, ${location.postal_code}, ${location.city}`
    )
  );
  await screen.findByText(
    containsRegexp(`common:postingTemplate.spots: ${testPosting.spots}`)
  );
  await screen.findByText(
    `${testPosting.contact_first_name} ${testPosting.contact_last_name}`
  );
  await screen.findByText(testPosting.contact_phone);
  await screen.findByText(testPosting.contact_email);
});
