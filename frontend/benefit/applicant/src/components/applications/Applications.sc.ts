import { Button } from 'hds-react';
import styled from 'styled-components';

export const $PrimaryButton = styled(Button)`
  background-color: ${(props) => props.theme.colors.coatOfArms} !important;
  border-color: ${(props) => props.theme.colors.coatOfArms} !important;
  color: ${(props) => props.theme.colors.white};
  & > div {
    --spinner-color: ${(props) => props.theme.colors.white} !important;
  }

  border-width: 3px !important;
  width: 170px;
`;

export const $SupplementaryButton = styled(Button)`
  color: ${(props) => props.theme.colors.black90} !important;
  min-width: 170px;
  max-height: 60px;
  margin-top: ${(props) => props.theme.spacing.xs2};
`;

export const $PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${(props) => props.theme.spacing.m};
  margin-top: ${(props) => props.theme.spacing.xs};
  & > div {
    flex: 1 0 50%;
  }
`;

export const $HeaderItem = styled.div``;

export const $PageHeading = styled.h1`
  font-size: ${(props) => props.theme.fontSize.heading.xl};
  font-weight: normal;
  margin: 0;
`;

export const $PageSubHeading = styled.h3`
  color: ${(props) => props.theme.colors.coatOfArms};
  font-size: ${(props) => props.theme.fontSize.heading.s};
  font-weight: 500;
  margin-top: ${(props) => props.theme.spacing.l};
  margin-bottom: ${(props) => props.theme.spacing.m};
`;

export const $PageHeadingHelperText = styled.div`
  font-size: ${(props) => props.theme.fontSize.heading.s};
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
