import { Button } from 'hds-react';
import $ from 'styled-components';

export const $SecondaryButton = $(Button)`
  color: ${(props) => props.theme.colors.black90} !important;
  border-color: ${(props) => props.theme.colors.black90} !important;
  border-width: 3px !important;
  min-width: 170px;
  max-height: 60px;
`;

export const $PrimaryButton = $(Button)`
  background-color: ${(props) => props.theme.colors.coatOfArms} !important;
  border-color: ${(props) => props.theme.colors.coatOfArms} !important;
  border-width: 3px !important;
  width: 170px;
`;

export const $SupplementaryButton = $(Button)`
  color: ${(props) => props.theme.colors.black90} !important;
  min-width: 170px;
  max-height: 60px;
  margin-top: ${(props) => props.theme.spacing.xs2};
`;

export const $PageHeader = $.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${(props) => props.theme.spacing.m};
  margin-top: ${(props) => props.theme.spacing.xs};
  & > div {
    flex: 1 0 50%;
  }
`;

export const $HeaderItem = $.div``;

export const $PageHeading = $.h1`
  font-size: ${(props) => props.theme.fontSize.heading.xl};
  font-weight: normal;
  margin: 0;
`;

export const $PageSubHeading = $.h3`
  color: ${(props) => props.theme.colors.coatOfArms};
  font-size: ${(props) => props.theme.fontSize.heading.s};
  font-weight: 500;
  margin-top: ${(props) => props.theme.spacing.l};
  margin-bottom: ${(props) => props.theme.spacing.m};
`;

export const $PageHeadingHelperText = $.div`
  font-size: ${(props) => props.theme.fontSize.heading.s};
  font-weight: normal;
  margin-top: ${(props) => props.theme.spacing.l};
  margin-bottom: ${(props) => props.theme.spacing.m};
`;

export const $ApplicationActions = $.div`
  display: flex;
  justify-content: space-between;
  margin-top: ${(props) => props.theme.spacing.l};
`;

export const $ApplicationAction = $.div`
  display: flex;
  flex-direction: column;
`;

export const $Empty = $.div``;
