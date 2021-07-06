import { Notification as HDSNotification } from 'hds-react';
import { StyledFormGroup } from 'shared/components/forms/section/styled';
import styled from 'styled-components';

const StyledCompanyInfoContainer = styled.div`
  display: grid;
  grid-template-columns: 50% 50%;
  grid-template-areas:
    'info notification'
    'address address'
    'iban iban';
  width: 100%;
`;

const StyledCompanyInfoSection = styled.div`
  grid-area: info;
  display: flex;
  flex-wrap: wrap;
`;

const StyledCompanyInfoColumn = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 0 50%;
`;

const StyledCompanyInfoRow = styled.div`
  display: flex;
  line-height: ${(props) => props.theme.lineHeight.l};
  height: ${(props) => `calc(${props.theme.lineHeight.l} * 1em)`};
  margin-right: ${(props) => props.theme.spacing.l};
  margin-bottom: ${(props) => props.theme.spacing.xs2};
`;

const StyledNotification = styled(HDSNotification)`
  grid-area: notification;
  font-size: ${(props) => props.theme.fontSize.heading.xs};
`;

const StyledAddressContainer = styled(StyledFormGroup)`
  grid-area: address;
  margin-top: ${(props) => props.theme.spacing.l};
  display: grid;
  grid-template-columns: 2fr 1fr 2fr 1fr;
`;

const StyledIBANContainer = styled(StyledFormGroup)`
  grid-area: iban;
  margin-top: ${(props) => props.theme.spacing.xl};

  input {
    width: 13.5em !important;
  }
`;

export {
  StyledAddressContainer,
  StyledCompanyInfoColumn,
  StyledCompanyInfoContainer,
  StyledCompanyInfoRow,
  StyledCompanyInfoSection,
  StyledIBANContainer,
  StyledNotification,
};
