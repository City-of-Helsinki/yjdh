import { Button } from 'hds-react';
import React from 'react';
import { $FormGroup } from 'shared/components/forms/section/FormSection.sc';
import $ from 'styled-components';

export const $Container = $.div`
  display: flex;
  justify-content: space-between;
  padding-bottom: ${(props) => props.theme.spacing.m};
`;

export const $TextContainer = $.div`
  flex: 1 0 50%;
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
  flex: 1 0 50%;
  box-sizing: border-box;
`;

export const $SubActionContainer = $.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  align-self: stretch;
  justify-self: stretch;
  box-sizing: border-box;
  background-color: white;
  flex: 1 0 auto;
  margin-right: 0 !important;
  padding-left: ${(props) => props.theme.spacing.s};
`;

interface ButtonProps {
  icon?: React.ReactNode;
}

export const $Button = $(Button)<ButtonProps>`
  background-color: ${(props) => props.theme.colors.coatOfArms} !important;
  border-color: ${(props) => props.theme.colors.coatOfArms} !important;
`;

export const $SubSection = $.div`
  margin-left: 245px;

  textarea {
    width: 640px !important;
  }
`;

export const $FieildsWithInfoContainer = $.div`
  display: flex;
  justify-content: space-between;
`;

export const $FieildsWithInfoColumn = $.div`
  flex: 0 0 50%;
`;

export const $ContactPersonContainer = $($FormGroup)`
  display: grid;
  grid-template-columns: 2fr 2fr 1fr 2fr;
  grid-gap: ${(props) => props.theme.spacing.xs};
`;

export const $EmployerBasicInfoContainer = $($FormGroup)`
  display: grid;
  grid-template-columns: 300px 300px 200px 200px;
  grid-gap: ${(props) => props.theme.spacing.xs};
`;

export const $EmploymentRelationshipContainer = $($FormGroup)`
  display: grid;
  grid-template-columns: 410px 200px 400px;
  grid-gap: ${(props) => props.theme.spacing.xs};
`;

export const $EmploymentMoneyContainer = $($FormGroup)`
  display: grid;
  grid-template-columns: 200px 200px 200px;
  grid-gap: ${(props) => props.theme.spacing.xs};
`;

export const $CommissionContainer = $($FormGroup)`
  display: grid;
  grid-template-columns: 500px 200px auto;
  grid-gap: ${(props) => props.theme.spacing.xs};
`;
