import { $Notification as NotificationBase } from 'benefit/applicant/components/Notification/Notification.sc';
import { Koros } from 'hds-react';
import { respondAbove } from 'shared/styles/mediaQueries';
import styled, { DefaultTheme } from 'styled-components';

export const $Container = styled.div`
  background-color: ${(props: { theme: DefaultTheme }) =>
    props.theme.colors.silver};
`;

export const $TextContainer = styled.div`
  display: flex;
  box-sizing: border-box;
  flex-direction: column;
  ${respondAbove('sm')`
    flex-direction: row;
  `}
`;

export const $Heading = styled.h1`
  font-size: ${(props: { theme: DefaultTheme }) =>
    props.theme.fontSize.heading.xl};
  font-weight: normal;
`;

export const $Description = styled.p`
  font-size: ${(props: { theme: DefaultTheme }) =>
    props.theme.fontSize.heading.s};
  line-height: ${(props: { theme: DefaultTheme }) => props.theme.lineHeight.l};
  margin-right: var(--spacing-s);
`;

export const $Link = styled.span`
  text-decoration: underline;
  cursor: pointer;
`;

export const $Notification = styled(NotificationBase)`
  margin-bottom: ${(props: { theme: DefaultTheme }) => props.theme.spacing.xs};
`;

export const $KorosContainer = styled.div`
  position: relative;
  overflow: hidden;
  margin-bottom: ${(props: { theme: DefaultTheme }) => props.theme.spacing.m};
`;

export const $Koros = styled(Koros)`
  fill: ${(props: { theme: DefaultTheme }) => props.theme.colors.silver};
  margin-top: calc(
    ${(props: { theme: DefaultTheme }) => props.theme.spacing.xl} * -1
  );
`;
