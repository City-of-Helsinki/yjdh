import styled from 'styled-components';

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
        ? 'calc(var(--spacing-s) + 12px)'
        : 'calc(var(--spacing-s) + 18px)'};
    top: ${({ $size }) =>
      $size === 'small'
        ? 'calc(var(--spacing-s) + 24px)'
        : 'calc(var(--spacing-s) + 36px)'};
    bottom: calc(-1 * var(--spacing-m));
    width: 2px;
    background-color: var(--timeline-item-line-color, var(--color-black-20));
    z-index: 1;
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
