import Postings from 'tet/youth/pages';
import { axe } from 'jest-axe';
import React from 'react';
import renderPage from 'tet/youth/__tests__/utils/components/render-page';
import { screen, userEvent, waitFor } from 'shared/__tests__/utils/test-utils';
import { fakeEventListYouth } from 'tet-shared/__tests__/utils/fake-objects';
import renderComponent from 'tet/youth/__tests__/utils/components/render-component';
import {
  expectToGetEventsPageFromBackend,
  expectToGetAllEventsFromBackend,
  expectAttributesFromLinkedEvents,
  expectWorkingMethodsFromLinkedEvents,
} from 'tet/youth/__tests__/utils/backend/backend-nocks';

jest.mock('next/router');

describe('frontend/tet/youth/src/pages/postings.tsx', () => {
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
    } = renderComponent(<Postings />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
