import { Card, IconInfoCircle, Link } from 'hds-react';
import styled, { DefaultTheme } from 'styled-components';

export const $PrerequisiteCard = styled(Card)`
  --background-color: ${(props: { theme: DefaultTheme }) =>
    props.theme.colors.fogMediumLight};
  display: flex;
  gap: ${(props: { theme: DefaultTheme }) => props.theme.spacing.m};
  padding-bottom: ${(props: { theme: DefaultTheme }) =>
    props.theme.spacingLayout.m};

  p {
    line-height: ${(props: { theme: DefaultTheme }) =>
      props.theme.lineHeight.l};
  }
`;

export const $IconInfoCircle = styled(IconInfoCircle)`
  flex: 0 0 auto;
  && {
    --icon-size: ${(props: { theme: DefaultTheme }) =>
      props.theme.spacingLayout.xl2};
  }
`;

export const $Heading = styled.h2`
  font-weight: 300;
  font-size: ${(props: { theme: DefaultTheme }) =>
    props.theme.fontSize.heading.l};
`;

export const $DownloadButtonContainer = styled.div`
  margin: ${(props: { theme: DefaultTheme }) => props.theme.spacing.m} 0;
`;

export const $Link = styled(Link)`
  --link-color: ${(props: { theme: DefaultTheme }) => props.theme.colors.black};
  --link-visited-color: ${(props: { theme: DefaultTheme }) =>
    props.theme.colors.black};
`;
