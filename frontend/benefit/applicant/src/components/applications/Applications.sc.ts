import { respondAbove } from 'shared/styles/mediaQueries';
import styled from 'styled-components';

export const $PageHeader = styled.div`
  display: block;
  margin-bottom: ${(props) => props.theme.spacing.s};
  margin-top: ${(props) => props.theme.spacing.m};

  & > * {
    margin-bottom: ${(props) => props.theme.spacing.m};
  }

  ${respondAbove('md')`
    flex: 1 0 100%;
    display: flex;
    justify-content: space-between;
    align-items: start;
  `};
`;

export const $HeaderItem = styled.div``;

export const $PageHeading = styled.h1`
  font-size: ${(props) => props.theme.fontSize.heading.xl};
  font-weight: normal;
  margin: 0;
`;

export const $PageSubHeading = styled.p`
  color: ${(props) => props.theme.colors.coatOfArms};
  font-size: ${(props) => props.theme.fontSize.heading.s};
  font-weight: 500;
  margin-top: ${(props) => props.theme.spacing.l};
  margin-bottom: ${(props) => props.theme.spacing.m};
`;

export const $PageHeadingHelperText = styled.div`
  font-size: ${(props) => props.theme.fontSize.heading.xs};
  font-weight: normal;
  margin-top: ${(props) => props.theme.spacing.l};
  margin-bottom: ${(props) => props.theme.spacing.m};
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
  padding-left: ${(props) => props.theme.spacing.l};
  padding-right: ${(props) => props.theme.spacing.l};
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
      background-color: ${(props) => props.theme.colors.coatOfArms};
      color: white;
      font-family: var(--font-default);
      padding: ${(props) => props.theme.spacing.xs}
        ${(props) => props.theme.spacing.m};
    }
  }
`;

export const $NoApplicationsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${(props) => props.theme.spacing.xs};
  margin: ${(props) => props.theme.spacingLayout.xl} 0;
`;
