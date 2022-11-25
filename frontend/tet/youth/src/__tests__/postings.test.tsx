import { within } from '@testing-library/react';
import { axe } from 'jest-axe';
import React from 'react';
import { waitForBackendRequestsToComplete } from 'shared/__tests__/utils/component.utils';
import { screen, userEvent, waitFor } from 'shared/__tests__/utils/test-utils';
import {
  expectAttributesFromLinkedEvents,
  expectToGetAllEventsFromBackend,
  expectToGetEventsPageFromBackend,
  expectWorkingMethodsFromLinkedEvents,
} from 'tet/youth/__tests__/utils/backend/backend-nocks';
import renderComponent from 'tet/youth/__tests__/utils/components/render-component';
import renderPage from 'tet/youth/__tests__/utils/components/render-page';
import Postings from 'tet/youth/pages';
import { fakeEventListYouth } from 'tet-shared/__tests__/utils/fake-objects';

jest.mock('next/router');

const postings = fakeEventListYouth(['Avustaja', 'Kirjasto']);

describe('frontend/tet/youth/src/pages/postings.tsx', () => {
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
    } = renderComponent(<Postings />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  // List items are not currently found after renderPage(). Nock urls seem to be correct after yarn test:debug-nock
  it.skip('should show tet postings markers on the map', async () => {
    expectToGetEventsPageFromBackend(postings);
    expectToGetAllEventsFromBackend(postings);
    expectAttributesFromLinkedEvents();
    expectWorkingMethodsFromLinkedEvents();
    renderPage(Postings);
    await waitForBackendRequestsToComplete();

    await userEvent.click(screen.getByRole('button', { name: /näytä tulokset kartalla/i }));
    // eslint-disable-next-line testing-library/no-node-access
    await waitFor(() => expect(document.querySelectorAll('.leaflet-marker-icon')).toHaveLength(2));
  });

  it.skip('should set correct filter optiongs to the component from url-pramas', async () => {
    expectToGetEventsPageFromBackend(postings);
    expectToGetAllEventsFromBackend(postings);
    renderPage(Postings);
    // set url params
    // Check that filters have correct values
  });

  it.skip('should show all the postings if there are no filters', async () => {
    expectToGetEventsPageFromBackend(postings);
    expectToGetAllEventsFromBackend(postings);
    renderPage(Postings);
    await screen.findByText(/2 hakutulosta/i);
    await screen.findByText(/avustaja/i);
    await screen.findByText(/kirjasto/i);
  });

  it.skip('should show links to the word searches if multiword search had no results', async () => {
    expectToGetEventsPageFromBackend(postings);
    expectToGetAllEventsFromBackend(postings);
    renderPage(Postings);
    // Set urlparam 'text' to 'kirjasto apulainen'
    const links = screen.getByTestId('search-word-links');
    await within(links).findByRole('link', {
      name: /kirjasto/i,
    });
    await within(links).findByRole('link', {
      name: /apulainen/i,
    });
  });
});
