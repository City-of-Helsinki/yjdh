import $, { DefaultTheme } from 'styled-components';

type Props = { isActive?: boolean };

interface $StepContainerProps {
  activeStep?: number;
}

const getActiveColor = (isActive: boolean, theme: DefaultTheme): string =>
  isActive ? theme.colors.black90 : theme.colors.black20;

export const $StepsContainer = $.div`
  display: flex;
  align-items: center;
`;

export const $StepContainer = $.div<$StepContainerProps>`
  display: flex;
  align-items: center;
  flex-direction: column;
  position: relative;
  z-index: 1;
`;

export const $StepCircle = $.div<Props>`
  height: 36px;
  width: 36px;
  border-radius: 50%;
  border: 4px solid
    ${({ isActive, theme }) => getActiveColor(isActive || false, theme)};
  text-align: center;
  color: ${({ isActive, theme }) => getActiveColor(isActive || false, theme)};
  font-weight: 600;
  position: relative;
  line-height: 36px;
  font-size: ${(props) => props.theme.fontSize.body.m};
`;

export const $StepTitle = $.p<Props>`
  text-align: center;
  position: absolute;
  bottom: -40px;
  color: ${({ isActive, theme }) => getActiveColor(isActive || false, theme)};
  font-size: ${(props) => props.theme.fontSize.body.m};
  font-weight: ${(props) => (props.isActive ? 600 : 500)};
`;

export const $Divider = $.div<Props>`
  width: 100%;
  height: 4px;
  margin: 4px;
  background: ${({ isActive, theme }) =>
    getActiveColor(isActive || false, theme)};
  flex: 1;
`;
