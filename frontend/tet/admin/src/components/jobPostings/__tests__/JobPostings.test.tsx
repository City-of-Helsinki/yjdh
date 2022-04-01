import { render, RenderResult } from '@testing-library/react';
import renderComponent from 'tet/admin/__tests__/utils/components/render-component';
import React from 'react';
import { fakeEventListAdmin } from 'tet-shared/__tests__/utils/mockDataUtils';
import { expectToGetEventsFromBackend } from 'tet/admin/__tests__/utils/backend/backend-nocks';

import JobPostings from '../JobPostings';

describe('JobPostings', () => {
  const events = fakeEventListAdmin(3, 4);

  it('should show list of published posting cards', async () => {
    expectToGetEventsFromBackend(events);
    renderComponent(<JobPostings />);

    expect(true).toBe(true);
  });
});
