import { $PageHeader as $PageHeaderBase } from 'benefit/applicant/components/applications/Applications.sc';
import styled from 'styled-components';

export const $BackButtonContainer = styled.div`
  padding-top: ${(props) => props.theme.spacingLayout.xs};
`;

export const $PageHeader = styled($PageHeaderBase)`
  flex-wrap: wrap;
`;

export const $MainHeaderItem = styled($PageHeaderBase)`
  flex: 0 0 100%;
  margin-bottom: 0;
`;

export const $PageHeading = styled.h1`
  font-size: ${(props) => props.theme.fontSize.heading.xl};
  font-weight: normal;
  margin-bottom: 0;
  margin-top: ${(props) => props.theme.spacingLayout.xs2};
`;
