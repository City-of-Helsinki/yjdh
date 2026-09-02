import { ApplicationListType } from 'kesaseteli/handler/types/application';
import { useTranslation } from 'next-i18next';
import React from 'react';
import useLocale from 'shared/hooks/useLocale';

import useApplicationTimelineQuery from '../../hooks/backend/useApplicationTimelineQuery';
import { TimelineItemType } from '../../types/timeline';
import Timeline, { TimelineSize } from '../timeline/Timeline';
import { getTimelineIcon } from '../timeline/TimelineTheme';
import { $PreWrapParagraph } from './ApplicationTimeline.sc';

export type ApplicationTimelineProps = {
  applicationId: string;
  applicationType: ApplicationListType;
  onToggle: () => void;
};

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
      {timeline
        .filter((item) => item.item_type === TimelineItemType.NOTE)
        .map((item) => {
          const noteType = item.note_type;
          const TypeIcon = getTimelineIcon(noteType);
          const formattedDate = new Date(item.created_at).toLocaleString(
            locale
          );

          return (
            <Timeline.Item
              key={item.id}
              type={noteType}
              isImportant={item.is_important}
              icon={TypeIcon}
              size={TimelineSize.small}
            >
              <Timeline.Item.Header>
                <Timeline.Item.Badge $type={noteType}>
                  {t(`common:handlerNotes.noteType.${noteType}`)}
                </Timeline.Item.Badge>
                <Timeline.Item.Author>
                  {item.author_name
                    ? t('common:handlerNotes.authorAt', {
                        author: item.author_name,
                        date: formattedDate,
                      })
                    : formattedDate}
                </Timeline.Item.Author>
              </Timeline.Item.Header>
              <Timeline.Item.Content>
                <$PreWrapParagraph>{item.content}</$PreWrapParagraph>
              </Timeline.Item.Content>
              <Timeline.Item.Link
                href={`#note-${item.id}`}
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
