import { Button } from 'hds-react';
import styled from 'styled-components';

export const $SecondaryButton = styled(Button)`
  color: ${(props) => props.theme.colors.black90} !important;
  border-color: ${(props) => props.theme.colors.black90} !important;
  border-width: 3px !important;
  min-width: 170px;
  max-height: 60px;
`;

export const $PrimaryButton = styled(Button)`
  border-width: 3px !important;
  width: 255px;
`;

export const $ApplicationActions = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: ${(props) => props.theme.spacing.l};
`;

export const $ApplicationAction = styled.div`
  display: flex;
  flex-direction: column;
`;
