import React from 'react';

import {
  $TimelineItemAvatar,
  $TimelineItemBody,
  $TimelineItemCard,
  $TimelineItemContent,
  $TimelineItemHeader,
  $TimelineItemLink,
} from './TimelineItem.sc';
import { NoteItemType } from './TimelineTheme';

export type TimelineCardProps = {
  children: React.ReactNode;
  type: NoteItemType;
  isImportant?: boolean;
  size?: 'small' | 'large';
  icon?: React.ComponentType;
  id?: string;
  'data-testid'?: string;
};

export const TimelineItem: React.FC<TimelineCardProps> & {
  Header: typeof $TimelineItemHeader;
  Content: typeof $TimelineItemContent;
  Link: typeof $TimelineItemLink;
} = ({
  children,
  type,
  isImportant = false,
  size = 'large',
  icon: Icon,
  id,
  'data-testid': dataTestId,
}) => (
  <$TimelineItemCard
    id={id}
    data-testid={dataTestId}
    $isImportant={isImportant}
    $type={type}
    $size={size}
  >
    {Icon && (
      <$TimelineItemAvatar $type={type} $size={size} aria-hidden="true">
        <Icon />
      </$TimelineItemAvatar>
    )}
    <$TimelineItemBody $size={size}>{children}</$TimelineItemBody>
  </$TimelineItemCard>
);

TimelineItem.Header = $TimelineItemHeader;
TimelineItem.Content = $TimelineItemContent;
TimelineItem.Link = $TimelineItemLink;
