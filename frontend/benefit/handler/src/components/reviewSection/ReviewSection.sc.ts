import { IconCheckCircle } from 'hds-react';
import styled, { DefaultTheme } from 'styled-components';

type ColorKeys = keyof DefaultTheme['colors'];
export type ColorValue = DefaultTheme['colors'][ColorKeys];

export type ReviewSectionWrapperProps = {
  withAction?: boolean;
  bgColor?: ColorValue;
};

export const $ActionLeft = styled.div`
  width: 102px;
`;

export const $CheckIcon = styled(IconCheckCircle)`
  padding-top: 20px;
  padding-left: ${(props) => props.theme.spacing.s};
`;
