import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import React from 'react';

import useHandlerNotesQuery from '../../../hooks/backend/useHandlerNotesQuery';
import useUser from '../../../hooks/useUser';
import { NoteTargetType, NoteType } from '../../../types/note';
import $AccordionSection from '../../form/AccordionSection.sc';
import NotesSection from '../NotesSection';

jest.mock('../../../hooks/useUser');
jest.mock('../../../hooks/backend/useHandlerNotesQuery');

const mockMutate = jest.fn();
jest.mock('../../../hooks/backend/useCreateNoteMutation', () => ({
  __esModule: true,
  default: () => ({
    mutate: mockMutate,
    isPending: false,
  }),
}));

const mockShowSuccessToast = jest.fn();
jest.mock('shared/components/toast/show-success-toast', () => ({
  __esModule: true,
  default: (...args: unknown[]) => mockShowSuccessToast(...args),
}));

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

  it('shows success toast when adding an internal note succeeds', async () => {
    renderComponent(
      <NotesSection
        targetId="app-1"
        targetType={NoteTargetType.YOUTH_APPLICATION}
      />
    );

    const textArea = screen.getByRole('textbox', { name: /kirjoita huomio/i });
    await userEvent.type(textArea, 'Internal note test');

    const submitBtn = screen.getByRole('button', { name: /lisää huomio/i });
    await userEvent.click(submitBtn);

    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        content: 'Internal note test',
        note_type: NoteType.INTERNAL,
      }),
      expect.any(Object)
    );

    const mutateOptions = mockMutate.mock.calls[0][1];
    mutateOptions.onSuccess();

    expect(mockShowSuccessToast).toHaveBeenCalledWith(
      'Huomion lisääminen onnistui',
      ''
    );
  });

  it('shows success toast when adding an external message succeeds', async () => {
    renderComponent(
      <NotesSection
        targetId="app-1"
        targetType={NoteTargetType.EMPLOYER_APPLICATION}
      />
    );

    const textArea = screen.getByRole('textbox', { name: /kirjoita huomio/i });
    await userEvent.type(textArea, 'External message test');

    const externalRadio = screen.getByLabelText(/ulkoinen viesti/i);
    await userEvent.click(externalRadio);

    const submitBtn = screen.getByRole('button', { name: /lisää huomio/i });
    await userEvent.click(submitBtn);

    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        content: 'External message test',
        note_type: NoteType.EXTERNAL_MESSAGE,
      }),
      expect.any(Object)
    );

    const mutateOptions = mockMutate.mock.calls[0][1];
    mutateOptions.onSuccess();

    expect(mockShowSuccessToast).toHaveBeenCalledWith(
      'Viestin lisääminen onnistui',
      ''
    );
  });
});
