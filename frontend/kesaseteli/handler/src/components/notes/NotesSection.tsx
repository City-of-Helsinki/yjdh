import { useTranslation } from 'next-i18next';
import React from 'react';
import showSuccessToast from 'shared/components/toast/show-success-toast';

import useCreateNoteMutation from '../../hooks/backend/useCreateNoteMutation';
import useHandlerNotesQuery from '../../hooks/backend/useHandlerNotesQuery';
import { CreateNotePayload, NoteTargetType, NoteType } from '../../types/note';
import NoteForm from './NoteForm';
import { $Instructions, $NotesContainer } from './NotesSection.sc';
import NotesSectionTimeline from './NotesSectionTimeline';

type Props = {
  targetId: string | undefined;
  targetType: NoteTargetType;
  parentApplicationId?: string;
  showTimeline?: boolean;
};

const NotesSection: React.FC<Props> = ({
  targetId,
  targetType,
  parentApplicationId,
  showTimeline,
}) => {
  const { t } = useTranslation();

  const createMutation = useCreateNoteMutation(
    targetType,
    targetId || '',
    parentApplicationId
  );

  const { data: notes = [] } = useHandlerNotesQuery(
    targetType,
    showTimeline ? targetId : undefined
  );

  return (
    <$NotesContainer>
      <$Instructions>
        <h3>{t('common:handlerNotes.instructions.label')}</h3>
        <p>{t('common:handlerNotes.instructions.content')}</p>
      </$Instructions>
      {targetId && (
        <NoteForm
          targetType={targetType}
          targetId={targetId}
          isLoading={createMutation.isPending}
          onSubmit={(payload, onSuccess) =>
            createMutation.mutate(payload as CreateNotePayload, {
              onSuccess: () => {
                onSuccess();
                const toastTitle =
                  payload.note_type === NoteType.EXTERNAL_MESSAGE
                    ? t('common:handlerNotes.addMessageSuccess')
                    : t('common:handlerNotes.addNoteSuccess');
                showSuccessToast(toastTitle, '');
              },
            })
          }
        />
      )}
      {showTimeline && (
        <NotesSectionTimeline
          notes={notes}
          parentApplicationId={parentApplicationId}
        />
      )}
    </$NotesContainer>
  );
};

export default NotesSection;
