import { Button } from 'hds-react';
import styled from 'styled-components';

const StyledSecondaryButton = styled(Button)`
  color: ${(props) => props.theme.colors.black90} !important;
  border-color: ${(props) => props.theme.colors.black90} !important;
  border-width: 3px !important;
  min-width: 170px;
  max-height: 60px;
`;

const StyledPrimaryButton = styled(Button)`
  background-color: ${(props) => props.theme.colors.coatOfArms} !important;
  border-color: ${(props) => props.theme.colors.coatOfArms} !important;
  border-width: 3px !important;
  width: 170px;
`;

const StyledSupplementaryButton = styled(Button)`
  color: ${(props) => props.theme.colors.black90} !important;
  min-width: 170px;
  max-height: 60px;
  margin-top: ${(props) => props.theme.spacing.xs2};
`;

const StyledPageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${(props) => props.theme.spacing.m};
  margin-top: ${(props) => props.theme.spacing.xs};
  & > div {
    flex: 1 0 50%;
  }
`;

const StyledHeaderItem = styled.div``;

const StyledPageHeading = styled.h1`
  font-size: ${(props) => props.theme.fontSize.heading.xl};
  font-weight: normal;
  margin: 0;
`;

const StyledApplicationActions = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: ${(props) => props.theme.spacing.l};
`;

const StyledApplicationAction = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledEmpty = styled.div``;

export {
  StyledApplicationAction,
  StyledApplicationActions,
  StyledEmpty,
  StyledHeaderItem,
  StyledPageHeader,
  StyledPageHeading,
  StyledPrimaryButton,
  StyledSecondaryButton,
  StyledSupplementaryButton,
};
