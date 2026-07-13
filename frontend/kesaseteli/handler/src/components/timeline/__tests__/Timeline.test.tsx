import { screen } from '@testing-library/react';
import { IconSpeechbubbleText } from 'hds-react';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import React from 'react';

import { NoteType } from '../../../types/note';
import Timeline from '../Timeline';

describe('Timeline & TimelineItem', () => {
  it('renders children correctly', () => {
    renderComponent(
      <Timeline>
        <Timeline.Item
          id="item-1"
          type={NoteType.INTERNAL}
          icon={IconSpeechbubbleText}
          size="large"
        >
          <Timeline.Item.Header>Author Name</Timeline.Item.Header>
          <Timeline.Item.Content>Event content details</Timeline.Item.Content>
          <Timeline.Item.Link href="/link">Jump to event</Timeline.Item.Link>
        </Timeline.Item>
      </Timeline>
    );

    expect(screen.getByText('Author Name')).toBeInTheDocument();
    expect(screen.getByText('Event content details')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /jump to event/i })
    ).toBeInTheDocument();
  });

  it('renders emptyState when children is empty', () => {
    renderComponent(
      <Timeline emptyState="No events recorded">{null}</Timeline>
    );

    expect(screen.getByText('No events recorded')).toBeInTheDocument();
  });

  it('applies styling attributes based on type, isImportant and size props', () => {
    renderComponent(
      <Timeline>
        <Timeline.Item
          id="test-item"
          data-testid="timeline-card-important"
          type={NoteType.INTERNAL}
          isImportant
          icon={IconSpeechbubbleText}
          size="small"
        >
          <Timeline.Item.Content>Test content</Timeline.Item.Content>
        </Timeline.Item>
      </Timeline>
    );

    const timelineItem = screen.getByTestId('timeline-card-important');
    expect(timelineItem).toHaveStyle(
      '--timeline-item-line-color: var(--color-alert)'
    );
    expect(timelineItem).toHaveStyle(
      '--timeline-item-background-color: var(--color-alert-light)'
    );
    expect(timelineItem).toHaveStyle(
      '--timeline-item-padding: var(--spacing-xs) var(--spacing-s)'
    );
  });
});
