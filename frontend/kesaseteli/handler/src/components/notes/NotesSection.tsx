import { useTranslation } from 'next-i18next';
import React from 'react';
import useLocale from 'shared/hooks/useLocale';

import useCreateNoteMutation from '../../hooks/backend/useCreateNoteMutation';
import useHandlerNotesQuery from '../../hooks/backend/useHandlerNotesQuery';
import { CreateNotePayload, NoteTargetType } from '../../types/note';
import Timeline, { TimelineSize } from '../timeline/Timeline';
import { getNoteTypeIcon } from '../timeline/TimelineTheme';
import NoteCard from './NoteCard';
import { $NoteTypeBadge } from './NoteCard.sc';
import NoteForm from './NoteForm';
import { $NotesContainer } from './NotesSection.sc';

type Props = {
  applicationId: string | undefined;
  targetType: NoteTargetType;
};

const NotesSection: React.FC<Props> = ({ applicationId, targetType }) => {
  const { t } = useTranslation();
  const locale = useLocale();

  const { data: notes = [] } = useHandlerNotesQuery(targetType, applicationId);

  const createMutation = useCreateNoteMutation(
    targetType,
    applicationId || ''
  );

  return (
    <$NotesContainer>
      {applicationId && (
        <NoteForm
          targetType={targetType}
          targetId={applicationId}
          isLoading={createMutation.isLoading}
          onSubmit={(payload, onSuccess) =>
            createMutation.mutate(payload as CreateNotePayload, { onSuccess })
          }
        />
      )}

      <Timeline
        reversed
        aria-label={t('common:handlerNotes.sectionTitle')}
        emptyState={t('common:handlerNotes.noNotes')}
      >
        {notes.map((note) => {
          const TypeIcon = getNoteTypeIcon(note.note_type);
          const formattedDate = new Date(note.created_at).toLocaleString(
            locale
          );

          return (
            <Timeline.Item
              key={note.id}
              id={`note-${note.id}`}
              data-testid={`note-card-${note.id}`}
              type={note.note_type}
              isImportant={note.is_important}
              icon={TypeIcon}
              size={TimelineSize.large}
            >
              <Timeline.Item.Header>
                <$NoteTypeBadge $type={note.note_type}>
                  {t(`common:handlerNotes.noteType.${note.note_type}`)}
                </$NoteTypeBadge>
                {t('common:handlerNotes.authorAt', {
                  author: note.author_name,
                  date: formattedDate,
                })}
              </Timeline.Item.Header>
              <Timeline.Item.Content>
                <NoteCard note={note} />
              </Timeline.Item.Content>
            </Timeline.Item>
          );
        })}
      </Timeline>
    </$NotesContainer>
  );
};

export default NotesSection;
