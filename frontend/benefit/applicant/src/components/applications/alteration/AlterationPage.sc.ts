import { $PageHeader as $PageHeaderBase } from 'benefit/applicant/components/applications/Applications.sc';
import styled, { DefaultTheme } from 'styled-components';

export const $BackButtonContainer = styled.div`
  padding-top: ${(props: { theme: DefaultTheme }) =>
    props.theme.spacingLayout.xs};
`;

export const $PageHeader = styled($PageHeaderBase)`
  flex-wrap: wrap;
`;

export const $MainHeaderItem = styled.div`
  flex: 0 0 100%;
  margin-bottom: 0;
`;

export const $PageHeading = styled.h1`
  font-size: ${(props: { theme: DefaultTheme }) =>
    props.theme.fontSize.heading.xl};
  font-weight: normal;
  margin-bottom: 0;
  margin-top: ${(props: { theme: DefaultTheme }) =>
    props.theme.spacingLayout.xs2};
`;

export const $AlterationFormContainer = styled.div`
  margin-top: ${(props: { theme: DefaultTheme }) =>
    props.theme.spacingLayout.s};
`;

export const $AlterationFormButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  margin-top: ${(props: { theme: DefaultTheme }) =>
    props.theme.spacingLayout.s};
`;
