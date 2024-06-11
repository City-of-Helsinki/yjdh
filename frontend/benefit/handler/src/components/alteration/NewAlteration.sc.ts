import styled from 'styled-components';

export const $GuideParagraphFirst = styled.p`
  margin: ${(props) => props.theme.spacing.l} 0
    ${(props) => props.theme.spacing.m};
`;

export const $GuideParagraphSecond = styled.p`
  margin: ${(props) => props.theme.spacing.m} 0
    ${(props) => props.theme.spacing.xl2};
`;

export const $AlterationFormStickyBarContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  gap: ${(props) => props.theme.spacingLayout.xs2};
`;
