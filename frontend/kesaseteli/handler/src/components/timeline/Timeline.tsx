import React from 'react';

import { $TimelineEmpty, $TimelineList } from './Timeline.sc';
import { TimelineItem } from './TimelineItem';

export const TimelineSize = {
  small: 'small',
  large: 'large',
} as const;

/* eslint-disable-next-line @typescript-eslint/no-redeclare */
export type TimelineSize = typeof TimelineSize[keyof typeof TimelineSize];

export type TimelineProps = {
  children: React.ReactNode;
  size?: TimelineSize;
  reversed?: boolean;
  'aria-label'?: string;
  emptyState?: React.ReactNode;
};

const Timeline: React.FC<TimelineProps> & {
  Item: typeof TimelineItem;
  Empty: typeof $TimelineEmpty;
} = ({
  children,
  size = 'large',
  reversed,
  'aria-label': ariaLabel,
  emptyState,
}) => {
  const hasChildren = React.Children.toArray(children).some(Boolean);

  if (!hasChildren && emptyState) {
    return <$TimelineEmpty>{emptyState}</$TimelineEmpty>;
  }

  return (
    <$TimelineList $size={size} reversed={reversed} aria-label={ariaLabel}>
      {children}
    </$TimelineList>
  );
};

Timeline.Item = TimelineItem;
Timeline.Empty = $TimelineEmpty;

export default Timeline;
