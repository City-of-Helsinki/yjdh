import { Button, IconAlertCircle } from 'hds-react';
import styled from 'styled-components';

export const $ErrorPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: ${(props) => props.theme.spacing.xl};
`;

export const $IconAlertCircle = styled(IconAlertCircle)`
  margin-top: ${(props) => props.theme.spacing.l};
`;

export const $ErrorPageMessage = styled.p`
  font-size: ${(props) => props.theme.fontSize.body.l};
  margin: 0;
`;

export const $ActionsContainer = styled.div`
  margin: ${(props) => props.theme.spacing.xl} 0;
  display: flex;
  button {
    margin-right: ${(props) => props.theme.spacing.m};
    width: 200px;
  }
`;

export const $ErrorPageTitle = styled.h1`
  font-size: ${(props) => props.theme.fontSize.heading.m};
`;

export const $PrimaryButton = styled(Button)`
  background-color: ${(props) => props.theme.colors.coatOfArms} !important;
  border-color: ${(props) => props.theme.colors.coatOfArms} !important;
  border-width: 3px !important;
  width: 170px;
`;
