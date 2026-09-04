import styled from 'styled-components';

export const $TimelineWrapper = styled.section`
  margin-top: var(--spacing-xl);
`;

export const $TimelineTitle = styled.h2`
  font-size: var(--fontsize-heading-m);
  font-weight: 500;
  margin-top: 0;
  margin-bottom: var(--spacing-xs);
  color: var(--color-black-90);
`;

export const $TimelineDescription = styled.p`
  font-size: var(--fontsize-body-m);
  line-height: var(--lineheight-l);
  color: var(--color-black-70);
  margin-top: 0;
  margin-bottom: var(--spacing-s);
  max-width: 800px;
`;

export const $StatusValue = styled.strong`
  font-weight: 600;
  color: var(--color-black-90);
`;

export const $PreWrapParagraph = styled.p`
  margin: var(--spacing-xs) 0;
  white-space: pre-wrap;
  word-break: break-word;
`;
