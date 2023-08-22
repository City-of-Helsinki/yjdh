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
