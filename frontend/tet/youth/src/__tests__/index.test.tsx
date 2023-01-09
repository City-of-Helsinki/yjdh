import faker from 'faker';
import { axe } from 'jest-axe';
import React from 'react';
import { screen, userEvent, waitFor } from 'shared/__tests__/utils/test-utils';
import { DEFAULT_LANGUAGE } from 'shared/i18n/i18n';
import { convertToUIDateFormat } from 'shared/utils/date.utils';
import renderComponent from 'tet/youth/__tests__/utils/components/render-component';
import renderPage from 'tet/youth/__tests__/utils/components/render-page';
import IndexPage from 'tet/youth/pages';

import getYouthTranslationsApi from './utils/i18n/get-youth-translations';

jest.mock('next/router');

describe('frontend/tet/youth/src/pages/index.tsx', () => {
  const {
    translations: { [DEFAULT_LANGUAGE]: translations },
  } = getYouthTranslationsApi();

  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query as unknown,
        onchange: null,
        addListener: jest.fn(), // Deprecated
        removeListener: jest.fn(), // Deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  it('should have no accessibility violations', async () => {
    const {
      renderResult: { container },
    } = renderComponent(<IndexPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  describe('when user searches', () => {
    it('should include text and start in query', async () => {
      const spyPush = jest.fn();
      renderPage(IndexPage, { push: spyPush });

      const text = faker.lorem.paragraph();
      const start = convertToUIDateFormat(faker.date.soon().toISOString());
      const searchField = screen.getByTestId('quickSearchInput');
      const startField = screen.getByTestId('startInput');

      await userEvent.type(searchField, text);
      await userEvent.type(startField, start);
      await userEvent.click(
        screen.getByRole('button', {
          name: new RegExp(translations.frontPage.fetch, 'i'),
        }),
      );

      await waitFor(() =>
        expect(spyPush).toHaveBeenCalledWith({
          pathname: '/postings',
          query: {
            text,
            start,
          },
        }),
      );
    });

    it('should work with empty search', async () => {
      const spyPush = jest.fn();
      renderPage(IndexPage, { push: spyPush });

      await userEvent.click(
        screen.getByRole('button', {
          name: new RegExp(translations.frontPage.fetch, 'i'),
        }),
      );

      await waitFor(() =>
        expect(spyPush).toHaveBeenCalledWith({
          pathname: '/postings',
          query: {},
        }),
      );
    });
  });
});
