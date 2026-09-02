import { useTranslation } from 'next-i18next';
import React from 'react';

import useCreateNoteMutation from '../../hooks/backend/useCreateNoteMutation';
import { CreateNotePayload, NoteTargetType } from '../../types/note';
import NoteForm from './NoteForm';
import { $Instructions, $NotesContainer } from './NotesSection.sc';

type Props = {
  applicationId: string | undefined;
  targetType: NoteTargetType;
};

const NotesSection: React.FC<Props> = ({ applicationId, targetType }) => {
  const { t } = useTranslation();
  const createMutation = useCreateNoteMutation(targetType, applicationId || '');

  return (
    <$NotesContainer>
      <$Instructions>
        <h3>{t('common:handlerNotes.instructions.label')}</h3>
        <p>{t('common:handlerNotes.instructions.content')}</p>
      </$Instructions>
      {applicationId && (
        <NoteForm
          targetType={targetType}
          targetId={applicationId}
          isLoading={createMutation.isPending}
          onSubmit={(payload, onSuccess) =>
            createMutation.mutate(payload as CreateNotePayload, { onSuccess })
          }
        />
      )}
    </$NotesContainer>
  );
};

export default NotesSection;
