import { screen } from '@testing-library/react';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import React from 'react';
import useLocale from 'shared/hooks/useLocale';

import {
  fakeActivityLogItem,
  fakeNotes,
} from '../../../__tests__/utils/backend/fake-notes';
import useUser from '../../../hooks/useUser';
import NotesTimeline from '../NotesTimeline';

jest.mock('shared/hooks/useLocale', () => jest.fn());
jest.mock('../../../hooks/useUser');

describe('NotesTimeline', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useLocale as jest.Mock).mockReturnValue('fi');
    (useUser as jest.Mock).mockReturnValue({
      user: {
        id: 'user-1',
        given_name: 'Test',
        family_name: 'User',
        name: 'Test User',
      },
    });
  });

  it('renders all notes', () => {
    renderComponent(<NotesTimeline timeline={fakeNotes(4)} />);

    expect(screen.getByText('note 1')).toBeInTheDocument();
    expect(screen.getByText('note 2')).toBeInTheDocument();
    expect(screen.getByText('note 3')).toBeInTheDocument();
    expect(screen.getByText('note 4')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /näytä kaikki/i })
    ).not.toBeInTheDocument();
  });

  it('renders application status changes', () => {
    renderComponent(
      <NotesTimeline
        timeline={[
          fakeActivityLogItem({
            old_value: 'submitted',
            new_value: 'additional_information_requested',
          }),
        ]}
      />
    );

    expect(screen.getByText('Tilamuutos')).toBeInTheDocument();
    expect(screen.getByText(/tila muuttunut:/i)).toBeInTheDocument();
    expect(screen.getByText('Lähetetty')).toBeInTheDocument();
    expect(screen.getByText('Lisätietoja pyydetty')).toBeInTheDocument();
  });

  it('displays the empty timeline state when there are no entries', () => {
    renderComponent(<NotesTimeline timeline={[]} />);

    expect(
      screen.getByText(/ei vielä tapahtumia aikajanalla/i)
    ).toBeInTheDocument();
  });
});
