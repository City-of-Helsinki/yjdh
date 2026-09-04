import { ApplicationListType } from 'kesaseteli/handler/types/application';
import { NoteTargetType } from 'kesaseteli/handler/types/note';
import { TFunction, Trans, useTranslation } from 'next-i18next';
import React from 'react';
import useLocale from 'shared/hooks/useLocale';
import type { KesaseteliAttachment } from 'shared/types/attachment';

import useApplicationTimelineQuery from '../../hooks/backend/useApplicationTimelineQuery';
import {
  ActionType,
  TimelineItem,
  TimelineItemType,
} from '../../types/timeline';
import NoteCard from '../notes/NoteCard';
import {
  $PreWrapParagraph,
  $StatusValue,
  $TimelineDescription,
  $TimelineTitle,
  $TimelineWrapper,
} from './ApplicationTimeline.sc';
import Timeline, { TimelineSize } from './Timeline';
import { getTimelineIcon, TimelineItemThemeType } from './TimelineTheme';

export type ApplicationTimelineProps = {
  applicationId: string;
  applicationType: ApplicationListType;
  title?: string;
  description?: string;
  attachments?: KesaseteliAttachment[];
};

const getItemThemeType = (item: TimelineItem): TimelineItemThemeType => {
  if (item.item_type === TimelineItemType.ACTIVITY) {
    if (item.action_type === ActionType.ATTACHMENT_ADDED) {
      return 'attachment_added';
    }
    if (item.action_type === ActionType.ATTACHMENT_DELETED) {
      return 'attachment_deleted';
    }
    return 'activity';
  }
  return item.note_type;
};

/**
 * Returns the rendered content for a timeline item based on its type and action.
 * Handles all cases: activity log entries (status changes, attachment events) and handler notes.
 */
const getTimelineItemContent = (
  item: TimelineItem,
  t: TFunction,
  applicationId: string,
  attachments?: KesaseteliAttachment[]
): React.ReactNode => {
  if (item.item_type === TimelineItemType.ACTIVITY) {
    const log = item;
    switch (log.action_type) {
      case ActionType.APPLICATION_STATUS_CHANGE:
        return (
          <$PreWrapParagraph>
            <Trans
              i18nKey="common:timeline.statusChange"
              values={{
                oldStatus: t(
                  `common:handlerApplication.applicationStatus.${log.old_value}`
                ),
                newStatus: t(
                  `common:handlerApplication.applicationStatus.${log.new_value}`
                ),
              }}
              components={{ statusValue: <$StatusValue /> }}
            />
          </$PreWrapParagraph>
        );

      case ActionType.ATTACHMENT_ADDED:
        return (
          <$PreWrapParagraph>
            <Trans
              i18nKey="common:timeline.attachmentAdded"
              values={{ fileName: log.new_value }}
              components={{
                attachment: log.target_id ? (
                  // eslint-disable-next-line jsx-a11y/anchor-has-content, jsx-a11y/control-has-associated-label
                  <a
                    href={`#attachment-${log.target_id}`}
                    style={{ fontWeight: 600 }}
                  />
                ) : (
                  <$StatusValue />
                ),
              }}
            />
          </$PreWrapParagraph>
        );

      case ActionType.ATTACHMENT_DELETED:
        return (
          <$PreWrapParagraph>
            <Trans
              i18nKey="common:timeline.attachmentDeleted"
              values={{ fileName: log.old_value }}
              components={{ attachment: <$StatusValue /> }}
            />
          </$PreWrapParagraph>
        );

      default:
        return null;
    }
  }

  // TimelineItemType.NOTE
  return (
    <>
      {item.target_type === NoteTargetType.ATTACHMENT && attachments && (
        <$PreWrapParagraph>
          <Trans
            i18nKey="common:timeline.relatedToAttachment"
            values={{
              fileName:
                attachments.find((a) => a.id === item.target_id)
                  ?.attachment_file_name || '',
            }}
            components={{
              attachmentLink: (
                // eslint-disable-next-line jsx-a11y/anchor-has-content, jsx-a11y/control-has-associated-label
                <a
                  href={`#attachment-${item.target_id}`}
                  style={{ fontWeight: 600 }}
                />
              ),
            }}
          />
        </$PreWrapParagraph>
      )}
      <NoteCard note={item} parentApplicationId={applicationId} />
    </>
  );
};

/**
 * ApplicationTimeline is the main unified timeline for an application.
 * It is displayed at the bottom of the application details page.
 *
 * It handles its own data fetching via `useApplicationTimelineQuery` and
 * displays a comprehensive history of the application, including:
 * - Application status changes
 * - Attachments added/deleted
 * - Handler notes and messages to the applicant
 *
 * DIFFERENCE: Use this component for the global application history view.
 * If you only need to display a specific list of notes (e.g. inside an accordion section),
 * use `NotesSectionTimeline` instead.
 */
const ApplicationTimeline: React.FC<ApplicationTimelineProps> = ({
  applicationId,
  applicationType,
  title,
  description,
  attachments,
}) => {
  const locale = useLocale();
  const { t } = useTranslation();

  const { data: timeline = [] } = useApplicationTimelineQuery(
    applicationId,
    applicationType
  );

  const heading = title ?? t('common:timeline.title');
  const note = description ?? t('common:timeline.description');

  return (
    <$TimelineWrapper>
      {heading && <$TimelineTitle>{heading}</$TimelineTitle>}
      {note && <$TimelineDescription>{note}</$TimelineDescription>}
      <Timeline
        size="large"
        aria-label={heading || t('common:timeline.title')}
        emptyState={t('common:timeline.emptyState')}
      >
        {timeline.map((item) => {
          const noteType = getItemThemeType(item);
          const TypeIcon = getTimelineIcon(noteType);
          const formattedDate = new Date(item.created_at).toLocaleString(
            locale
          );
          const key =
            item.item_type === TimelineItemType.ACTIVITY
              ? `activity-${item.created_at}-${item.action_type}`
              : item.id;
          const isImportant =
            item.item_type === TimelineItemType.NOTE
              ? item.is_important
              : false;

          return (
            <Timeline.Item
              key={key}
              type={noteType}
              isImportant={isImportant}
              icon={TypeIcon}
              size={TimelineSize.large}
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
                {getTimelineItemContent(item, t, applicationId, attachments)}
              </Timeline.Item.Content>
            </Timeline.Item>
          );
        })}
      </Timeline>
    </$TimelineWrapper>
  );
};

export default ApplicationTimeline;
