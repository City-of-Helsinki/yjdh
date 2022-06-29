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
import { within } from '@testing-library/react';
import { waitForBackendRequestsToComplete } from 'shared/__tests__/utils/component.utils';

jest.mock('next/router');

const postings = fakeEventListYouth(['Avustaja', 'Kirjasto']);

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

  it.skip('should show tet postings markers on the map', async () => {
    expectToGetEventsPageFromBackend(postings);
    expectToGetAllEventsFromBackend(postings);
    expectAttributesFromLinkedEvents();
    expectWorkingMethodsFromLinkedEvents();
    renderPage(Postings);
    await waitForBackendRequestsToComplete();

    userEvent.click(screen.getByRole('button', { name: /näytä tulokset kartalla/i }));
    await waitFor(() => expect(document.querySelectorAll('.leaflet-marker-icon')).toHaveLength(2));
  });

  it.skip('should set correct filter optiongs to the component from url-pramas', async () => {
    expectToGetEventsPageFromBackend(postings);
    expectToGetAllEventsFromBackend(postings);
    renderPage(Postings);
    //set url params
  });

  it.skip('should show all the postings if there are no filters', async () => {
    expectToGetEventsPageFromBackend(postings);
    expectToGetAllEventsFromBackend(postings);
    renderPage(Postings);
    await screen.findByText(/2 hakutulosta/i);
    await screen.findByText(/Avustaja/i);
    await screen.findByText(/Kirjasto/i);
  });

  it.skip('should show links to the word searches if multiword search had no results', async () => {
    expectToGetEventsPageFromBackend(postings);
    expectToGetAllEventsFromBackend(postings);
    renderPage(Postings);
    //Set urlparam 'text' to 'kirjasto apulainen'
    const links = screen.getByTestId('search-word-links');
    await within(links).findByRole('link', {
      name: /kirjasto/i,
    });
    await within(links).findByRole('link', {
      name: /apulainen/i,
    });
  });
});
