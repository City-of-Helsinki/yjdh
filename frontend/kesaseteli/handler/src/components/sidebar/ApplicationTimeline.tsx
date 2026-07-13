import { ApplicationListType } from 'kesaseteli/handler/types/application';
import { useTranslation } from 'next-i18next';
import React from 'react';
import useLocale from 'shared/hooks/useLocale';
import styled from 'styled-components';

import useApplicationTimelineQuery from '../../hooks/backend/useApplicationTimelineQuery';
import { $NoteContent, $NoteTypeBadge } from '../notes/NoteCard.sc';
import Timeline, { TimelineSize } from '../timeline/Timeline';
import { getNoteTypeIcon } from '../timeline/TimelineTheme';

export type ApplicationTimelineProps = {
  applicationId: string;
  applicationType: ApplicationListType;
  onToggle: () => void;
};

const $TimelineItemAuthor = styled.b`
  display: block;
  margin-top: var(--spacing-s);
`;


const ApplicationTimeline: React.FC<ApplicationTimelineProps> = ({
  applicationId,
  applicationType,
  onToggle,
}) => {
  const locale = useLocale();
  const { t } = useTranslation();

  const { data: timeline = [] } = useApplicationTimelineQuery(
    applicationId,
    applicationType
  );

  const handleNoteClick = (): void => {
    // Close the sidebar so the note anchor scroll is unobstructed
    onToggle();
  };

  return (
    <Timeline
      size="small"
      aria-label={t('common:timeline.title')}
      emptyState={t('common:timeline.emptyState')}
    >
      {timeline.map((note) => {
        const TypeIcon = getNoteTypeIcon(note.note_type);
        const formattedDate = new Date(note.created_at).toLocaleString(locale);

        return (
          <Timeline.Item
            key={note.id}
            type={note.note_type}
            isImportant={note.is_important}
            icon={TypeIcon}
            size={TimelineSize.small}
          >
            <Timeline.Item.Header>
              <$NoteTypeBadge $type={note.note_type}>
                {t(`common:handlerNotes.noteType.${note.note_type}`)}
              </$NoteTypeBadge>
              <$TimelineItemAuthor>{t('common:handlerNotes.authorAt', {
                author: note.author_name,
                date: formattedDate,
              })}</$TimelineItemAuthor>
            </Timeline.Item.Header>
            <Timeline.Item.Content>
              <$NoteContent>{note.content}</$NoteContent>
            </Timeline.Item.Content>
            <Timeline.Item.Link
              href={`#note-${note.id}`}
              onClick={handleNoteClick}
            >
              {t('common:timeline.jumpToNote')}
            </Timeline.Item.Link>
          </Timeline.Item>
        );
      })}
    </Timeline>
  );
};

export default ApplicationTimeline;
