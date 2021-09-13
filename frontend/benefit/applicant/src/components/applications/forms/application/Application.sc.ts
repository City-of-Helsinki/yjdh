import { $FormGroup } from 'shared/components/forms/section/FormSection.sc';
import styled from 'styled-components';

export const $SubActionContainer = styled.div`
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

export const $SubSection = styled.div`
  margin-left: 245px;

  textarea {
    width: 640px !important;
  }
`;

export const $FieldsWithInfoContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const $FieldsWithInfoColumn = styled.div`
  flex: 0 0 50%;
`;

export const $ContactPersonContainer = styled($FormGroup)`
  display: grid;
  grid-template-columns: 3fr 3fr 2fr 4fr;
  grid-gap: ${({ theme }) => `${theme.spacing.m} ${theme.spacing.xs}`};
  align-items: baseline;
`;

export const $EmployerBasicInfoContainer = styled($FormGroup)`
  display: grid;
  grid-template-columns: 300px 300px 200px 200px;
  grid-gap: ${(props) => props.theme.spacing.xs};
`;

export const $EmploymentRelationshipContainer = styled($FormGroup)`
  display: grid;
  grid-template-columns: 410px 200px 400px;
  grid-gap: ${(props) => props.theme.spacing.xs};
`;

export const $EmploymentMoneyContainer = styled($FormGroup)`
  display: grid;
  grid-template-columns: 200px 200px 200px;
  grid-gap: ${(props) => props.theme.spacing.xs};
`;

export const $CommissionContainer = styled($FormGroup)`
  display: grid;
  grid-template-columns: 500px 200px auto;
  grid-gap: ${(props) => props.theme.spacing.xs};
`;

export const $ViewFieldsContainer = styled.div`
  display: flex;
  margin-bottom: ${(props) => props.theme.spacing.m};
`;

export const $ViewFieldsGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-right: ${(props) => props.theme.spacing.xl2};
`;

export const $ViewField = styled.span`
  font-weight: 400;
`;

export const $ViewFieldBold = styled.span`
  font-weight: 500;
`;

export const $ViewListContainer = styled.div``;

export const $ViewListRow = styled.div`
  display: grid;
  grid-template-columns: 400px 300px 300px;
`;

export const $ViewListHeading = styled.div`
  font-weight: 500;
  margin-bottom: ${(props) => props.theme.spacing.m};
`;
