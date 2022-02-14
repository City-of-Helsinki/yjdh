import { $Notification as NotificationBase } from 'benefit/applicant/components/Notification/Notification.sc';
import styled from 'styled-components';

export const $Container = styled.div`
  padding-bottom: ${(props) => props.theme.spacing.m};
`;

export const $TextContainer = styled.div`
  display: flex;
  box-sizing: border-box;
`;

export const $Heading = styled.h1`
  font-size: ${(props) => props.theme.fontSize.heading.xl};
  font-weight: normal;
`;

export const $Description = styled.p`
  font-size: ${(props) => props.theme.fontSize.heading.s};
  line-height: ${(props) => props.theme.lineHeight.l};
`;

export const $Link = styled.span`
  text-decoration: underline;
  cursor: pointer;
`;

export const $ActionContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  flex: 1 0 30%;
  box-sizing: border-box;
`;

export const $Notification = styled(NotificationBase)`
  margin-bottom: ${(props) => props.theme.spacing.xs};
`;
