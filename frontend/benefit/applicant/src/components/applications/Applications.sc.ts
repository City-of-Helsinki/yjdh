import { respondAbove } from 'shared/styles/mediaQueries';
import styled, { DefaultTheme } from 'styled-components';

export const $PageHeader = styled.div`
  display: block;
  margin-bottom: ${(props: { theme: DefaultTheme }) => props.theme.spacing.s};
  margin-top: ${(props: { theme: DefaultTheme }) => props.theme.spacing.m};
  margin-bottom: ${(props: { theme: DefaultTheme }) => props.theme.spacing.m};
  border-bottom: ${(props: { theme: DefaultTheme }) =>
    `1px solid ${props.theme.colors.black20}`};

  ${respondAbove('md')`
    flex: 1 0 100%;
    display: flex;
    justify-content: space-between;
    align-items: start;
  `};
`;

export const $HeaderItem = styled.div``;

export const $HeaderRightColumnItem = styled.div`
  margin-top: ${(props: { theme: DefaultTheme }) => props.theme.spacing.m};

  ${respondAbove('md')`
    text-align: right;
  `};
`;

export const $PageHeading = styled.h1`
  font-size: ${(props: { theme: DefaultTheme }) =>
    props.theme.fontSize.heading.xl};
  font-weight: normal;
  margin: 0;
`;

export const $PageHeadingApplicant = styled.div`
  margin-top: var(--spacing-m);
  margin-bottom: var(--spacing-m);
  font-size: ${(props: { theme: DefaultTheme }) =>
    props.theme.fontSize.body.xl};
`;

export const $PageSubHeading = styled.p`
  color: ${(props: { theme: DefaultTheme }) => props.theme.colors.coatOfArms};
  font-size: ${(props: { theme: DefaultTheme }) =>
    props.theme.fontSize.heading.s};
  font-weight: 500;
  margin-top: ${(props: { theme: DefaultTheme }) => props.theme.spacing.l};
  margin-bottom: ${(props: { theme: DefaultTheme }) => props.theme.spacing.m};
`;

export const $PageHeadingHelperText = styled.div`
  font-size: ${(props: { theme: DefaultTheme }) =>
    props.theme.fontSize.heading.xs};
  font-weight: normal;
  margin-top: ${(props: { theme: DefaultTheme }) => props.theme.spacing.l};
  margin-bottom: ${(props: { theme: DefaultTheme }) => props.theme.spacing.m};
`;

export const $SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

export const $Empty = styled.div``;

export const $AskemContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 129px;
  margin: 0;
  padding-left: ${(props: { theme: DefaultTheme }) => props.theme.spacing.l};
  padding-right: ${(props: { theme: DefaultTheme }) => props.theme.spacing.l};
  ${respondAbove('sm')`
    flex-direction: row;
  `}
`;

export const $AskemItem = styled.div`
  display: flex;
  flex-flow: column;
  ${respondAbove('sm')`
    min-width: 13%;
  `}
  .rns-plugin {
    .rns-header {
      font-weight: 500;
    }
    .rns-inputs .rns-form-submit {
      background-color: ${(props: { theme: DefaultTheme }) =>
        props.theme.colors.coatOfArms};
      color: white;
      font-family: var(--font-default);
      padding: ${(props: { theme: DefaultTheme }) => props.theme.spacing.xs}
        ${(props: { theme: DefaultTheme }) => props.theme.spacing.m};
    }
  }
`;

export const $NoApplicationsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${(props: { theme: DefaultTheme }) => props.theme.spacing.xs};
  margin: ${(props: { theme: DefaultTheme }) => props.theme.spacingLayout.xl} 0;
`;
