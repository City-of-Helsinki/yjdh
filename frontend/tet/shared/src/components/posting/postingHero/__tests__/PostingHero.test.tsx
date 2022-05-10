import { render, screen } from '@testing-library/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import React from 'react';
import theme from 'shared/styles/theme';
import { ThemeProvider } from 'styled-components';
import { fakeTetPosting } from 'tet-shared/__tests__/utils/fake-objects';
import TetPosting from 'tet-shared/types/tetposting';

import PostingHero from '../PostingHero';

type Props = {
  posting: TetPosting;
  showBackButton: boolean;
};

const title = 'Posting title';
const org_name = 'Organization name';

const getFakePosting = (overrides?: Partial<TetPosting>): TetPosting =>
  fakeTetPosting({
    title,
    org_name,
    ...overrides,
  });

const renderComponent = (props?: Partial<Props>): ReturnType<typeof render> =>
  render(
    <ThemeProvider theme={theme}>
      <PostingHero
        posting={getFakePosting()}
        showBackButton={false}
        {...props}
      />
    </ThemeProvider>
  );

test('should render title, organization name ', async () => {
  renderComponent();
  await screen.findByRole('heading', { name: title });
  await screen.findByRole('heading', { name: org_name });
});
