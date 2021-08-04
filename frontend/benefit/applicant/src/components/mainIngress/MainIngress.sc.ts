import { Notification } from 'hds-react';
import $ from 'styled-components';

export const $Container = $.div`
  padding-bottom: ${(props) => props.theme.spacing.m};
`;

export const $TextContainer = $.div`
  display: flex;
  box-sizing: border-box;
`;

export const $Heading = $.h1`
  font-size: ${(props) => props.theme.fontSize.heading.xl};
  font-weight: normal;
`;

export const $Description = $.p`
  font-size: ${(props) => props.theme.fontSize.heading.s};
  font-weight: normal;
  line-height: ${(props) => props.theme.lineHeight.l};
`;

export const $Link = $.span`
  text-decoration: underline;
  cursor: pointer;
`;

export const $ActionContainer = $.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  flex: 1 0 30%;
  box-sizing: border-box;
`;

export const $Notification = $(Notification)`
  margin-bottom: ${(props) => props.theme.spacing.xs};
`;
