import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IconSpeechbubbleText } from 'hds-react';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import React from 'react';
import useLocale from 'shared/hooks/useLocale';

import { fakeNote } from '../../../__tests__/utils/backend/fake-notes';
import useDeleteNoteMutation from '../../../hooks/backend/useDeleteNoteMutation';
import useUpdateNoteMutation from '../../../hooks/backend/useUpdateNoteMutation';
import useUser from '../../../hooks/useUser';
import { HandlerNote, NoteType } from '../../../types/note';
import Timeline from '../../timeline/Timeline';
import NoteCard from '../NoteCard';

jest.mock('../../../hooks/backend/useUpdateNoteMutation');
jest.mock('shared/hooks/useLocale', () => jest.fn());
jest.mock('../../../hooks/backend/useDeleteNoteMutation');
jest.mock('../../../hooks/useUser');

const mockNote: HandlerNote = fakeNote({
  id: 'note-1',
  content: 'Original note content',
  author_name: 'Test Author',
});

const mockMutateUpdate = jest.fn();
const mockMutateDelete = jest.fn();

describe('NoteCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useLocale as jest.Mock).mockReturnValue('fi');
    (useUpdateNoteMutation as jest.Mock).mockReturnValue({
      mutate: mockMutateUpdate,
      isLoading: false,
    });
    (useDeleteNoteMutation as jest.Mock).mockReturnValue({
      mutate: mockMutateDelete,
      isLoading: false,
    });
    (useUser as jest.Mock).mockReturnValue({
      user: { id: 'user-1' },
    });
  });

  it('renders note content and author meta info', () => {
    (useUser as jest.Mock).mockReturnValue({
      user: { id: 'user-2' },
    });
    renderComponent(
      <Timeline>
        <Timeline.Item
          id={`note-${mockNote.id}`}
          type={mockNote.note_type}
          isImportant={mockNote.is_important}
          icon={IconSpeechbubbleText}
          size="large"
        >
          <Timeline.Item.Header>{mockNote.author_name}</Timeline.Item.Header>
          <Timeline.Item.Content>
            <NoteCard note={mockNote} />
          </Timeline.Item.Content>
        </Timeline.Item>
      </Timeline>
    );

    expect(screen.getByText('Original note content')).toBeInTheDocument();
    expect(screen.getByText(/Test Author/)).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /muokkaa/i })
    ).not.toBeInTheDocument();
  });

  it('renders edit/delete buttons if current user is the author', () => {
    renderComponent(<NoteCard note={mockNote} />);

    expect(
      screen.getByRole('button', { name: /muokkaa/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /poista/i })).toBeInTheDocument();
  });

  it('opens edit form when Muokkaa is clicked and cancels correctly', async () => {
    renderComponent(<NoteCard note={mockNote} />);

    await userEvent.click(screen.getByRole('button', { name: /muokkaa/i }));

    const textArea = screen.getByLabelText(/muokkaa/i);
    expect(textArea).toBeInTheDocument();
    expect(textArea).toHaveValue('Original note content');

    await userEvent.click(screen.getByRole('button', { name: /peruuta/i }));

    expect(screen.queryByLabelText(/muokkaa/i)).not.toBeInTheDocument();
    expect(screen.getByText('Original note content')).toBeInTheDocument();
  });

  it('saves edit content successfully', async () => {
    renderComponent(<NoteCard note={mockNote} />);

    await userEvent.click(screen.getByRole('button', { name: /muokkaa/i }));

    const textArea = screen.getByLabelText(/muokkaa/i);
    await userEvent.clear(textArea);
    await userEvent.type(textArea, 'Updated note content');

    await userEvent.click(
      screen.getByRole('button', { name: /tallenna huomio/i })
    );

    expect(mockMutateUpdate).toHaveBeenCalledWith(
      {
        content: 'Updated note content',
        note_type: NoteType.INTERNAL,
        is_important: false,
      },
      expect.any(Object)
    );
  });

  it('renders delete dialog and confirms deletion', async () => {
    renderComponent(<NoteCard note={mockNote} />);

    await userEvent.click(screen.getByRole('button', { name: /poista/i }));

    expect(
      await screen.findByText(/poistetaanko huomio\?/i)
    ).toBeInTheDocument();

    const [, confirmButton] = await screen.findAllByRole('button', {
      name: /poista/i,
    });
    await userEvent.click(confirmButton);

    expect(mockMutateDelete).toHaveBeenCalledWith('note-1', expect.any(Object));
  });

  it('applies visual treatment for important notes', () => {
    const importantNote = { ...mockNote, is_important: true };
    renderComponent(
      <Timeline>
        <Timeline.Item
          id={`note-${importantNote.id}`}
          data-testid={`note-card-${importantNote.id}`}
          type={importantNote.note_type}
          isImportant={importantNote.is_important}
          icon={IconSpeechbubbleText}
          size="large"
        >
          <Timeline.Item.Content>
            <NoteCard note={importantNote} />
          </Timeline.Item.Content>
        </Timeline.Item>
      </Timeline>
    );

    const card = screen.getByTestId('note-card-note-1');
    expect(card).toHaveStyle('border-right-color: var(--color-alert)');
  });

  it('applies standard visual treatment for normal notes', () => {
    renderComponent(
      <Timeline>
        <Timeline.Item
          id={`note-${mockNote.id}`}
          data-testid={`note-card-${mockNote.id}`}
          type={mockNote.note_type}
          isImportant={mockNote.is_important}
          icon={IconSpeechbubbleText}
          size="large"
        >
          <Timeline.Item.Content>
            <NoteCard note={mockNote} />
          </Timeline.Item.Content>
        </Timeline.Item>
      </Timeline>
    );

    const card = screen.getByTestId('note-card-note-1');
    expect(card).toHaveStyle('border-right-color: var(--color-black-20)');
  });
});
