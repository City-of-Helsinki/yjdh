import styled, { DefaultTheme } from 'styled-components';

export const $TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 740px;
  margin-bottom: ${(props: { theme: DefaultTheme }) => props.theme.spacing.l};
`;

export const $Heading = styled.h2`
  font-size: ${(props: { theme: DefaultTheme }) =>
    props.theme.fontSize.heading.m};
  font-weight: 500;
  margin: 0;
`;

export const $Description = styled.p`
  font-size: ${(props: { theme: DefaultTheme }) =>
    props.theme.fontSize.heading.xs};
  line-height: ${(props: { theme: DefaultTheme }) => props.theme.lineHeight.l};
`;

export const $WarningContainer = styled.div`
  display: flex;
  align-items: center;
  flex: 1 0 30%;
  font-weight: 500;

  svg {
    margin-right: ${(props: { theme: DefaultTheme }) =>
      props.theme.spacing.xs2};
  }
`;
