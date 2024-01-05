import { $Notification as NotificationBase } from 'benefit/applicant/components/Notification/Notification.sc';
import { Koros } from 'hds-react';
import { respondAbove } from 'shared/styles/mediaQueries';
import styled from 'styled-components';

export const $Container = styled.div`
  background-color: ${(props) => props.theme.colors.silver};
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
  font-size: ${(props) => props.theme.fontSize.heading.xl};
  font-weight: normal;
`;

export const $Description = styled.p`
  font-size: ${(props) => props.theme.fontSize.heading.s};
  line-height: ${(props) => props.theme.lineHeight.l};
  margin-right: var(--spacing-s);
`;

export const $Link = styled.span`
  text-decoration: underline;
  cursor: pointer;
`;

export const $ActionContainer = styled.div`
  display: flex;
  align-items: center;
  flex: 1 0 30%;
  box-sizing: border-box;
  ${respondAbove('sm')`
    justify-content: flex-end;
  `}
`;

export const $Notification = styled(NotificationBase)`
  margin-bottom: ${(props) => props.theme.spacing.xs};
`;

export const $KorosContainer = styled.div`
  position: relative;
  overflow: hidden;
  margin-bottom: ${(props) => props.theme.spacing.m};
`;

export const $Koros = styled(Koros)`
  fill: ${(props) => props.theme.colors.silver};
  margin-top: calc(${(props) => props.theme.spacing.xl} * -1);
`;
