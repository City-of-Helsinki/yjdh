import {
  ButtonSize,
  ButtonVariant,
  IconPenLine,
  IconTrash,
} from 'hds-react';
import { useTranslation } from 'next-i18next';
import React, { useState } from 'react';
import Button from 'shared/components/button/Button';

import useDeleteNoteMutation from '../../hooks/backend/useDeleteNoteMutation';
import useUpdateNoteMutation from '../../hooks/backend/useUpdateNoteMutation';
import useUser from '../../hooks/useUser';
import { HandlerNote, UpdateNotePayload } from '../../types/note';
import DeleteNoteDialog from './DeleteNoteDialog';
import {
  $ButtonText,
  $NoteActions,
  $NoteCardContainer,
  $NoteContent,
} from './NoteCard.sc';
import NoteForm from './NoteForm';



type Props = {
  note: HandlerNote;
};

const NoteCard: React.FC<Props> = ({ note }) => {
  const { t } = useTranslation();
  const { user } = useUser();
  const currentUserId = user?.id;
  const isAuthor =
    Boolean(currentUserId) && note.author_username === currentUserId;
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const updateMutation = useUpdateNoteMutation(
    note.id,
    note.target_type,
    note.target_id
  );

  const deleteMutation = useDeleteNoteMutation(
    note.target_type,
    note.target_id
  );

  const handleDeleteConfirm = (): void => {
    deleteMutation.mutate(note.id, {
      onSuccess: () => setIsDeleteDialogOpen(false),
    });
  };

  return (
    <$NoteCardContainer>
      {isEditing ? (
        <NoteForm
          initialNote={note}
          targetType={note.target_type}
          targetId={note.target_id}
          isLoading={updateMutation.isLoading}
          onSubmit={(payload, onSuccess) =>
            updateMutation.mutate(payload as UpdateNotePayload, { onSuccess })
          }
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <>
          <$NoteContent>{note.content}</$NoteContent>
          {isAuthor && (
            <$NoteActions>
              {/*
                $ButtonText visually hides the label text on mobile view to prevent layout breaking/wrapping,
                while the button's aria-label ensures the action remains fully accessible to screen readers.
              */}
              <Button
                variant={ButtonVariant.Supplementary}
                size={ButtonSize.Small}
                iconStart={<IconPenLine aria-hidden />}
                onClick={() => setIsEditing(true)}
                data-testid={`note-edit-button-${note.id}`}
                aria-label={t('common:handlerNotes.editNote')}
              >
                <$ButtonText>{t('common:handlerNotes.editNote')}</$ButtonText>
              </Button>
              <Button
                variant={ButtonVariant.Supplementary}
                size={ButtonSize.Small}
                iconStart={<IconTrash aria-hidden />}
                onClick={() => setIsDeleteDialogOpen(true)}
                data-testid={`note-delete-button-${note.id}`}
                aria-label={t('common:handlerNotes.deleteNote')}
              >
                <$ButtonText>{t('common:handlerNotes.deleteNote')}</$ButtonText>
              </Button>
            </$NoteActions>
          )}
        </>
      )}

      {isDeleteDialogOpen && (
        <DeleteNoteDialog
          id={note.id}
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDeleteConfirm}
          isDeleting={deleteMutation.isLoading}
        />
      )}
    </$NoteCardContainer>
  );
};

export default NoteCard;
