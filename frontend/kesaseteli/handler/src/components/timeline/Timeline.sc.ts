import styled from 'styled-components';

/**
 * Dimensions of the timeline item avatars/icons.
 * These are used to calculate the connector line's position and align it with the avatar's center.
 */
export const TIMELINE_AVATAR_SIZE = {
  small: 24, // px
  large: 36, // px
} as const;

export const TIMELINE_AVATAR_HALF_SIZE = {
  small: TIMELINE_AVATAR_SIZE.small / 2, // 12px - half of small avatar width, used for centering
  large: TIMELINE_AVATAR_SIZE.large / 2, // 18px - half of large avatar width, used for centering
} as const;

/**
 * Width of the first column in the timeline grid.
 * - For small: matches the small avatar size exactly (24px).
 * - For large: 40px (provides the 36px avatar with 4px of extra breathing room on the right side).
 */
export const TIMELINE_COLUMN_WIDTH = {
  small: TIMELINE_AVATAR_SIZE.small, // 24px
  large: 40, // 40px
} as const;

export const $TimelineList = styled.ol<{ $size?: 'small' | 'large' }>`
  list-style: none;
  padding: 0;
  margin: var(--spacing-m) 0 0 0;
  position: relative;

  & > li::before {
    content: '';
    position: absolute;
    left: ${({ $size }) =>
    $size === 'small'
      ? `${TIMELINE_AVATAR_HALF_SIZE.small}px`
      : `${TIMELINE_AVATAR_HALF_SIZE.large}px`};
    top: ${({ $size }) =>
    $size === 'small'
      ? `${TIMELINE_AVATAR_SIZE.small}px`
      : `${TIMELINE_AVATAR_SIZE.large}px`};
    bottom: calc(-1 * var(--spacing-m));
    width: 2px;
    background-color: var(--timeline-item-line-color, var(--color-black-20));
    z-index: 1;
    margin-bottom: var(--spacing-m);
  }

  & > li:last-child::before {
    display: none;
  }
`;

export const $TimelineEmpty = styled.p`
  margin: var(--spacing-m);
  color: var(--color-black-60);
  font-size: var(--fontsize-body-m);
`;
