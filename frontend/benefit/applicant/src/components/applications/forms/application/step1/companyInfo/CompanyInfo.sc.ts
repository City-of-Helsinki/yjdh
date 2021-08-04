import { Notification as HDSNotification } from 'hds-react';
import { $FormGroup } from 'shared/components/forms/section/FormSection.sc';
import $ from 'styled-components';

export const $CompanyInfoContainer = $.div`
  display: grid;
  grid-template-columns: 50% 50%;
  grid-template-areas:
    'info notification'
    'address address'
    'iban iban';
  width: 100%;
`;

export const $CompanyInfoSection = $.div`
  grid-area: info;
  display: flex;
  flex-wrap: wrap;
`;

export const $CompanyInfoColumn = $.div`
  display: flex;
  flex-direction: column;
  flex: 1 0 50%;
`;

export const $CompanyInfoRow = $.div`
  display: flex;
  line-height: ${(props) => props.theme.lineHeight.l};
  height: ${(props) => `calc(${props.theme.lineHeight.l} * 1em)`};
  margin-right: ${(props) => props.theme.spacing.l};
  margin-bottom: ${(props) => props.theme.spacing.xs2};
`;

export const $Notification = $(HDSNotification)`
  grid-area: notification;
  font-size: ${(props) => props.theme.fontSize.heading.xs};
`;

export const $AddressContainer = $($FormGroup)`
  grid-area: address;
  margin-top: ${(props) => props.theme.spacing.l};
  display: grid;
  grid-template-columns: 2fr 1fr 2fr 1fr;
`;

export const $IBANContainer = $($FormGroup)`
  grid-area: iban;
  margin-top: ${(props) => props.theme.spacing.xl};

  input {
    width: 13.5em !important;
  }
`;
