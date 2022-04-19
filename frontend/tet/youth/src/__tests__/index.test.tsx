import IndexPage from 'tet/youth/pages';
import { axe } from 'jest-axe';
import React from 'react';

import renderComponent from 'tet/youth/__tests__/utils/components/render-component';
import renderPage from 'tet/youth/__tests__/utils/components/render-page';
import { screen, userEvent, waitFor } from 'shared/__tests__/utils/test-utils';

jest.mock('next/router');

describe('frontend/tet/youth/src/pages/index.tsx', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
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
      await renderPage(IndexPage, { push: spyPush });

      const text = 'testsearch';
      const start = '1.1.2022';
      const searchField = screen.getByTestId('quickSearchInput');
      const startField = screen.getByTestId('startInput');

      userEvent.type(searchField, text);
      userEvent.type(startField, start);
      userEvent.click(
        screen.getByRole('button', {
          name: /hae/i,
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
      await renderPage(IndexPage, { push: spyPush });

      userEvent.click(
        screen.getByRole('button', {
          name: /hae/i,
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
