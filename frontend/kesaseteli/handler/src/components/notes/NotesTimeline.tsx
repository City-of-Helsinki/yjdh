import { Trans, useTranslation } from 'next-i18next';
import React from 'react';
import useLocale from 'shared/hooks/useLocale';

import {
  ActionType,
  TimelineItem,
  TimelineItemType,
} from '../../types/timeline';
import Timeline, { TimelineSize } from '../timeline/Timeline';
import { getTimelineIcon } from '../timeline/TimelineTheme';
import NoteCard from './NoteCard';
import { $PreWrapParagraph, $StatusValue } from './NotesTimeline.sc';

type Props = {
  timeline: TimelineItem[];
};

const NotesTimeline: React.FC<Props> = ({ timeline }) => {
  const { t } = useTranslation();
  const locale = useLocale();

  return (
    <Timeline
      reversed
      aria-label={t('common:timeline.title')}
      emptyState={t('common:timeline.emptyState')}
    >
      {timeline.map((item) => {
        const isActivity = item.item_type === TimelineItemType.ACTIVITY;
        const noteType = isActivity ? 'activity' : item.note_type;
        const TypeIcon = getTimelineIcon(noteType);
        const formattedDate = new Date(item.created_at).toLocaleString(locale);
        const key = isActivity
          ? `activity-${item.created_at}-${item.action_type}`
          : item.id;
        const isModified =
          !isActivity &&
          Math.abs(Date.parse(item.modified_at) - Date.parse(item.created_at)) >
            1000;

        return (
          <Timeline.Item
            key={key}
            {...(!isActivity && {
              id: `note-${item.id}`,
              'data-testid': `note-card-${item.id}`,
            })}
            type={noteType}
            isImportant={isActivity ? false : item.is_important}
            icon={TypeIcon}
            size={TimelineSize.large}
          >
            <Timeline.Item.Header>
              <Timeline.Item.Badge $type={noteType}>
                {t(`common:handlerNotes.noteType.${noteType}`)}
              </Timeline.Item.Badge>
              {t('common:handlerNotes.authorAt', {
                author: item.author_name,
                date: formattedDate,
              })}
              {isModified && ` - ${t('common:handlerNotes.modified')}`}
            </Timeline.Item.Header>
            <Timeline.Item.Content>
              {isActivity &&
              item.action_type === ActionType.APPLICATION_STATUS_CHANGE ? (
                <$PreWrapParagraph>
                  <Trans
                    i18nKey="common:timeline.statusChange"
                    values={{
                      oldStatus: t(
                        `common:handlerApplication.applicationStatus.${item.old_value}`
                      ),
                      newStatus: t(
                        `common:handlerApplication.applicationStatus.${item.new_value}`
                      ),
                    }}
                    components={{ statusValue: <$StatusValue /> }}
                  />
                </$PreWrapParagraph>
              ) : (
                !isActivity && <NoteCard note={item} />
              )}
            </Timeline.Item.Content>
          </Timeline.Item>
        );
      })}
    </Timeline>
  );
};

export default NotesTimeline;
