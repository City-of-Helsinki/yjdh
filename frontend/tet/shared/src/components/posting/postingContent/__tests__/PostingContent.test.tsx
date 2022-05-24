import { containsRegexp } from '@frontend/shared/src/__tests__/utils/translation-utils';
import { render, screen, within } from '@testing-library/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import React from 'react';
import theme from 'shared/styles/theme';
import { ThemeProvider } from 'styled-components';
import {
  fakeLocation,
  fakeOptions,
  fakeTetPosting,
} from 'tet-shared/__tests__/utils/fake-objects';
import TetPosting from 'tet-shared/types/tetposting';

import PostingContent from '../PostingContent';

type Props = {
  posting: TetPosting;
};

const keywords = ['Keyword 1', 'Keyword 2'];
const method_keywords = ['Method 1', 'Method 2'];
const attribute_keywords = ['Attribute 1', 'Attribute 2'];

const location = fakeLocation({
  name: 'Harjoittelu',
  city: 'Helsinki',
  street_address: 'Siltasaarenkatu 18',
  postal_code: '00530',
});

const testPosting = {
  title: 'Test title',
  description: 'Test description',
  start_date: '3.5.2022',
  end_date: '10.5.2022',
  contact_phone: '0455548885',
  contact_email: 'tester@mail.com',
  location,
  languages: [{ value: 'fi', label: 'Suomi', name: 'Suomi' }],
  keywords: fakeOptions(keywords),
  keywords_working_methods: fakeOptions(method_keywords),
  keywords_attributes: fakeOptions(attribute_keywords),
};

const infoHasData = async (
  title: string,
  contents: string[]
): Promise<void> => {
  const heading = await screen.findByRole('heading', {
    name: title,
  });
  for (const content of contents) {
    // eslint-disable-next-line testing-library/no-node-access
    await within(heading?.parentElement).findByText(containsRegexp(content));
  }
};

const renderComponent = (props?: Partial<Props>): ReturnType<typeof render> =>
  render(
    <ThemeProvider theme={theme}>
      <PostingContent posting={fakeTetPosting(testPosting)} {...props} />
    </ThemeProvider>
  );

test('it should render keywords, working methods and attributes', () => {
  renderComponent();
  const allKeyWords = [...keywords, ...method_keywords, ...attribute_keywords];
  allKeyWords.forEach((keyword) => {
    expect(screen.queryByText(keyword)).toBeInTheDocument();
  });
});

test('it should render title and description', async () => {
  renderComponent();
  await screen.findByRole('heading', { name: testPosting.title });
  await screen.findByText(testPosting.description);
});

test('it should render side colunmn info', async () => {
  renderComponent();
  await infoHasData('common:postingTemplate.dateAndTime', [
    '3.5.2022 - 10.5.2022',
  ]);
  await infoHasData('common:postingTemplate.contact', [
    testPosting.contact_phone,
    testPosting.contact_email,
  ]);
  await infoHasData('common:postingTemplate.languages', ['Suomi']);
  await infoHasData('common:postingTemplate.location', [
    location.name,
    location.street_address,
    `${location.postal_code} ${location.city}`,
  ]);
});

test('it should show a map with a marker', async () => {
  const { container } = renderComponent();
  // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container
  expect(container.querySelectorAll('.leaflet-marker-icon')).toHaveLength(1);
});
