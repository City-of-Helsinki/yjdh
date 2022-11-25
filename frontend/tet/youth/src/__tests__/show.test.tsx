import { axe } from 'jest-axe';
import React from 'react';
import renderComponent from 'tet/youth/__tests__/utils/components/render-component';
import ShowPostingPage from 'tet/youth/pages';

jest.mock('next/router');

describe('frontend/tet/youth/src/pages/postings/show.tsx', () => {
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
    } = renderComponent(<ShowPostingPage />);
    // TODO it renders the 404 page without any query parameters
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
