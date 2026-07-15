import { ApplicationListType } from 'kesaseteli/handler/types/application';
import { Trans, useTranslation } from 'next-i18next';
import React from 'react';
import useLocale from 'shared/hooks/useLocale';

import useApplicationTimelineQuery from '../../hooks/backend/useApplicationTimelineQuery';
import { ActionType, TimelineItemType } from '../../types/timeline';
import Timeline, { TimelineSize } from '../timeline/Timeline';
import { getTimelineIcon } from '../timeline/TimelineTheme';
import { $PreWrapParagraph, $StatusValue } from './ApplicationTimeline.sc';

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
      {timeline.map((item) => {
        const isActivity = item.item_type === TimelineItemType.ACTIVITY;
        const noteType = isActivity ? 'activity' : item.note_type;
        const TypeIcon = getTimelineIcon(noteType);
        const formattedDate = new Date(item.created_at).toLocaleString(locale);
        const key = isActivity
          ? `activity-${item.created_at}-${item.action_type}`
          : item.id;
        const isImportant = isActivity ? false : item.is_important;

        return (
          <Timeline.Item
            key={key}
            type={noteType}
            isImportant={isImportant}
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
                <$PreWrapParagraph>
                  {!isActivity ? item.content : ''}
                </$PreWrapParagraph>
              )}
            </Timeline.Item.Content>
            {!isActivity && (
              <Timeline.Item.Link
                href={`#note-${item.id}`}
                onClick={handleNoteClick}
              >
                {t('common:timeline.jumpToNote')}
              </Timeline.Item.Link>
            )}
          </Timeline.Item>
        );
      })}
    </Timeline>
  );
};

export default ApplicationTimeline;
