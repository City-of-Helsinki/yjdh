import { screen } from '@testing-library/react';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import React from 'react';

import useHandlerNotesQuery from '../../../hooks/backend/useHandlerNotesQuery';
import useUser from '../../../hooks/useUser';
import { NoteTargetType, NoteType } from '../../../types/note';
import $AccordionSection from '../../form/AccordionSection.sc';
import NotesSection from '../NotesSection';

jest.mock('../../../hooks/useUser');
jest.mock('../../../hooks/backend/useHandlerNotesQuery');

describe('NotesSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useUser as jest.Mock).mockReturnValue({
      user: {
        id: 'user-1',
        given_name: 'Test',
        family_name: 'User',
        name: 'Test User',
      },
    });
    (useHandlerNotesQuery as jest.Mock).mockReturnValue({
      data: [],
    });
  });

  it('renders the note form in an open accordion', () => {
    renderComponent(
      <$AccordionSection
        id="notes-accordion"
        heading="Käsittelijän huomiot"
        initiallyOpen
      >
        <NotesSection
          targetId="app-1"
          targetType={NoteTargetType.YOUTH_APPLICATION}
        />
      </$AccordionSection>
    );

    expect(
      screen.getByRole('button', { name: /^käsittelijän huomiot$/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', { name: /kirjoita huomio/i })
    ).toBeInTheDocument();
  });

  it('renders timeline when showTimeline is true and notes are present', () => {
    (useHandlerNotesQuery as jest.Mock).mockReturnValue({
      data: [
        {
          id: 'note-1',
          content: 'Important note content',
          author_username: 'user-1',
          author_name: 'Test User',
          note_type: NoteType.INTERNAL,
          is_important: false,
          created_at: '2026-09-03T12:00:00Z',
          modified_at: '2026-09-03T12:00:00Z',
          target_type: NoteTargetType.ATTACHMENT,
          target_id: 'att-1',
        },
      ],
    });

    renderComponent(
      <NotesSection
        targetId="att-1"
        targetType={NoteTargetType.ATTACHMENT}
        showTimeline
      />
    );

    expect(screen.getByText('Important note content')).toBeInTheDocument();
  });
});
