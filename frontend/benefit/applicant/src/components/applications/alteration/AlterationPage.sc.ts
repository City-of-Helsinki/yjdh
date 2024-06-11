import { $PageHeader as $PageHeaderBase } from 'benefit/applicant/components/applications/Applications.sc';
import styled from 'styled-components';

export const $BackButtonContainer = styled.div`
  padding-top: ${(props) => props.theme.spacingLayout.xs};
`;

export const $PageHeader = styled($PageHeaderBase)`
  flex-wrap: wrap;
`;

export const $MainHeaderItem = styled.div`
  flex: 0 0 100%;
  margin-bottom: 0;
`;

export const $PageHeading = styled.h1`
  font-size: ${(props) => props.theme.fontSize.heading.xl};
  font-weight: normal;
  margin-bottom: 0;
  margin-top: ${(props) => props.theme.spacingLayout.xs2};
`;

export const $AlterationFormContainer = styled.div`
  margin-top: ${(props) => props.theme.spacingLayout.s};
`;

export const $AlterationFormButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  margin-top: ${(props) => props.theme.spacingLayout.s};
`;
