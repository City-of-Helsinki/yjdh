import { screen } from '@testing-library/react';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import React from 'react';
import useLocale from 'shared/hooks/useLocale';

import { fakeNotes } from '../../../__tests__/utils/backend/fake-notes';
import useHandlerNotesQuery from '../../../hooks/backend/useHandlerNotesQuery';
import useUser from '../../../hooks/useUser';
import { NoteTargetType } from '../../../types/note';
import $AccordionSection from '../../form/AccordionSection.sc';
import NotesSection from '../NotesSection';

jest.mock('../../../hooks/backend/useHandlerNotesQuery');
jest.mock('../../../hooks/useUser');
jest.mock('shared/hooks/useLocale', () => jest.fn());

const mockNotes = fakeNotes(4);

describe('NotesSection', () => {
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

  it('renders Accordion as open by default and displays empty state', () => {
    (useHandlerNotesQuery as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
    });

    renderComponent(
      <$AccordionSection
        id="notes-accordion"
        heading="Käsittelijän huomiot"
        initiallyOpen
        onToggle={() => { }}
      >
        <NotesSection
          applicationId="app-1"
          targetType={NoteTargetType.YOUTH_APPLICATION}
        />
      </$AccordionSection>
    );

    expect(
      screen.getByRole('button', { name: /käsittelijän huomiot/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/ei vielä huomioita/i)).toBeInTheDocument();
  });

  it('renders all notes', () => {
    (useHandlerNotesQuery as jest.Mock).mockReturnValue({
      data: mockNotes,
      isLoading: false,
    });

    renderComponent(
      <NotesSection
        applicationId="app-1"
        targetType={NoteTargetType.YOUTH_APPLICATION}
      />
    );

    expect(screen.getByText('note 1')).toBeInTheDocument();
    expect(screen.getByText('note 2')).toBeInTheDocument();
    expect(screen.getByText('note 3')).toBeInTheDocument();
    expect(screen.getByText('note 4')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /näytä kaikki/i })
    ).not.toBeInTheDocument();
  });
});
