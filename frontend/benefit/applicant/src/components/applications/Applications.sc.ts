import { Button } from 'hds-react';
import $ from 'styled-components';

const $SecondaryButton = $(Button)`
  color: ${(props) => props.theme.colors.black90} !important;
  border-color: ${(props) => props.theme.colors.black90} !important;
  border-width: 3px !important;
  min-width: 170px;
  max-height: 60px;
`;

const $PrimaryButton = $(Button)`
  background-color: ${(props) => props.theme.colors.coatOfArms} !important;
  border-color: ${(props) => props.theme.colors.coatOfArms} !important;
  border-width: 3px !important;
  width: 170px;
`;

const $SupplementaryButton = $(Button)`
  color: ${(props) => props.theme.colors.black90} !important;
  min-width: 170px;
  max-height: 60px;
  margin-top: ${(props) => props.theme.spacing.xs2};
`;

const $PageHeader = $.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${(props) => props.theme.spacing.m};
  margin-top: ${(props) => props.theme.spacing.xs};
  & > div {
    flex: 1 0 50%;
  }
`;

const $HeaderItem = $.div``;

const $PageHeading = $.h1`
  font-size: ${(props) => props.theme.fontSize.heading.xl};
  font-weight: normal;
  margin: 0;
`;

const $ApplicationActions = $.div`
  display: flex;
  justify-content: space-between;
  margin-top: ${(props) => props.theme.spacing.l};
`;

const $ApplicationAction = $.div`
  display: flex;
  flex-direction: column;
`;

const $Empty = $.div``;

export {
  $ApplicationAction,
  $ApplicationActions,
  $Empty,
  $HeaderItem,
  $PageHeader,
  $PageHeading,
  $PrimaryButton,
  $SecondaryButton,
  $SupplementaryButton,
};
