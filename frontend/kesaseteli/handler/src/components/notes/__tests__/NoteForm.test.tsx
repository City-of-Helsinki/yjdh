import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import React from 'react';
import useLocale from 'shared/hooks/useLocale';

import { fakeNotes } from '../../../__tests__/utils/backend/fake-notes';
import { NoteTargetType, NoteType } from '../../../types/note';
import NoteForm from '../NoteForm';

jest.mock('shared/hooks/useLocale', () => jest.fn());

describe('NoteForm', () => {
  const mockSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useLocale as jest.Mock).mockReturnValue('fi');
  });

  describe('Create Mode', () => {
    it('renders correctly and has INTERNAL pre-selected', () => {
      renderComponent(
        <NoteForm
          targetType={NoteTargetType.YOUTH_APPLICATION}
          targetId="app-1"
          onSubmit={mockSubmit}
          isLoading={false}
        />
      );

      const textArea = screen.getByLabelText(/kirjoita huomio/i);
      expect(textArea).toBeInTheDocument();

      const internalRadio = screen.getByLabelText(/sisäinen huomio/i);
      const externalRadio = screen.getByLabelText(/ulkoinen viesti/i);
      expect(internalRadio).toBeChecked();
      expect(externalRadio).not.toBeChecked();

      const importantCheckbox = screen.getByLabelText(/merkitse tärkeäksi/i);
      expect(importantCheckbox).not.toBeChecked();
    });

    it('submits form with correct inputs', async () => {
      renderComponent(
        <NoteForm
          targetType={NoteTargetType.YOUTH_APPLICATION}
          targetId="app-1"
          onSubmit={mockSubmit}
          isLoading={false}
        />
      );

      const textArea = screen.getByLabelText(/kirjoita huomio/i);
      await userEvent.type(textArea, 'New test note');

      const importantCheckbox = screen.getByLabelText(/merkitse tärkeäksi/i);
      await userEvent.click(importantCheckbox);

      const submitBtn = screen.getByRole('button', {
        name: /lisää huomio/i,
      });
      await userEvent.click(submitBtn);

      expect(mockSubmit).toHaveBeenCalledWith(
        {
          target_type: NoteTargetType.YOUTH_APPLICATION,
          target_id: 'app-1',
          content: 'New test note',
          note_type: NoteType.INTERNAL,
          is_important: true,
        },
        expect.any(Function)
      );
    });

    it('submit button is disabled when content is empty', () => {
      renderComponent(
        <NoteForm
          targetType={NoteTargetType.YOUTH_APPLICATION}
          targetId="app-1"
          onSubmit={mockSubmit}
          isLoading={false}
        />
      );

      const submitBtn = screen.getByRole('button', {
        name: /lisää huomio/i,
      });
      expect(submitBtn).toBeDisabled();
    });

    it('shows live remaining character counter', async () => {
      renderComponent(
        <NoteForm
          targetType={NoteTargetType.YOUTH_APPLICATION}
          targetId="app-1"
          onSubmit={mockSubmit}
          isLoading={false}
        />
      );

      expect(screen.getByText('4 096 / 4 096')).toBeInTheDocument();

      const textArea = screen.getByLabelText(/kirjoita huomio/i);
      await userEvent.type(textArea, 'abc');

      expect(screen.getByText('4 093 / 4 096')).toBeInTheDocument();
    });
  });

  describe('Edit Mode', () => {
    const mockNote = fakeNotes(1)[0];

    it('initializes form with existing note data', () => {
      const note = {
        ...mockNote,
        content: 'Existing content',
        note_type: NoteType.EXTERNAL_MESSAGE,
        is_important: true,
      };

      renderComponent(
        <NoteForm
          initialNote={note}
          targetType={note.target_type}
          targetId={note.target_id}
          onSubmit={mockSubmit}
          isLoading={false}
        />
      );

      const textArea = screen.getByLabelText(/muokkaa/i);
      expect(textArea).toHaveValue('Existing content');

      const internalRadio = screen.getByLabelText(/sisäinen huomio/i);
      const externalRadio = screen.getByLabelText(/ulkoinen viesti/i);
      expect(internalRadio).not.toBeChecked();
      expect(externalRadio).toBeChecked();

      const importantCheckbox = screen.getByLabelText(/merkitse tärkeäksi/i);
      expect(importantCheckbox).toBeChecked();

      expect(
        screen.getByRole('button', { name: /tallenna huomio/i })
      ).toBeInTheDocument();
    });

    it('submits updated content', async () => {
      renderComponent(
        <NoteForm
          initialNote={mockNote}
          targetType={mockNote.target_type}
          targetId={mockNote.target_id}
          onSubmit={mockSubmit}
          isLoading={false}
        />
      );

      const textArea = screen.getByLabelText(/muokkaa/i);
      await userEvent.clear(textArea);
      await userEvent.type(textArea, 'Updated text');

      const submitBtn = screen.getByRole('button', {
        name: /tallenna huomio/i,
      });
      await userEvent.click(submitBtn);

      expect(mockSubmit).toHaveBeenCalledWith(
        {
          content: 'Updated text',
          note_type: mockNote.note_type,
          is_important: mockNote.is_important,
        },
        expect.any(Function)
      );
    });
  });
});
