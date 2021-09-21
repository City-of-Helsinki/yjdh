import styled from 'styled-components';

export const $TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 740px;
  margin-bottom: ${(props) => props.theme.spacing.l};
`;

export const $Heading = styled.h1`
  font-size: ${(props) => props.theme.fontSize.heading.m};
  font-weight: 500;
  margin: 0;
`;

export const $Description = styled.p`
  font-size: ${(props) => props.theme.fontSize.heading.s};
  line-height: ${(props) => props.theme.lineHeight.l};
`;
