import { useTranslation } from 'next-i18next';
import React from 'react';
import useLocale from 'shared/hooks/useLocale';

import type { HandlerNote } from '../../types/note';
import Timeline, { TimelineSize } from '../timeline/Timeline';
import { getTimelineIcon } from '../timeline/TimelineTheme';
import NoteCard from './NoteCard';

type Props = {
  notes: HandlerNote[];
  parentApplicationId?: string;
};

/**
 * NotesSectionTimeline is a specialized timeline used *inside* the "Notes" accordion section.
 *
 * It is a "dumb" component that receives its list of `notes` via props and only
 * displays standard handler notes. It does not handle its own data fetching,
 * and it does not display other application events (like status changes or attachments).
 *
 * DIFFERENCE: Use this component only for rendering the nested list of notes in the Notes accordion.
 * For the global application timeline at the bottom of the page, use `ApplicationTimeline` instead.
 */
const NotesSectionTimeline: React.FC<Props> = ({
  notes,
  parentApplicationId,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  return (
    <Timeline
      reversed
      aria-label={t('common:handlerNotes.sectionTitle')}
      emptyState={t('common:handlerNotes.noNotes')}
    >
      {notes.map((note) => {
        const TypeIcon = getTimelineIcon(note.note_type);
        const formattedDate = new Date(note.created_at).toLocaleString(locale);

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
              <Timeline.Item.Badge $type={note.note_type}>
                {t(`common:handlerNotes.noteType.${note.note_type}`)}
              </Timeline.Item.Badge>
              {t('common:handlerNotes.authorAt', {
                author: note.author_name,
                date: formattedDate,
              })}
            </Timeline.Item.Header>
            <Timeline.Item.Content>
              <NoteCard
                key={note.id}
                note={note}
                parentApplicationId={parentApplicationId}
              />
            </Timeline.Item.Content>
          </Timeline.Item>
        );
      })}
    </Timeline>
  );
};

export default NotesSectionTimeline;
