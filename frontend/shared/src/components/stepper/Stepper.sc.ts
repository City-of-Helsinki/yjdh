import styled, { DefaultTheme } from 'styled-components';

type Props = { isActive?: boolean };

type $StepContainerProps = Props & {
  activeStep?: number;
};

const getActiveColor = (isActive: boolean, theme: DefaultTheme): string =>
  isActive ? theme.colors.black90 : theme.colors.black20;

const circleSize = 36;
export const $StepCircle = styled.div<Props>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: ${circleSize}px;
  width: ${circleSize}px;
  border-radius: 50%;
  border: ${(props) => (props.isActive ? '4px' : '2px')} solid
    ${({ isActive, theme }) => getActiveColor(isActive || false, theme)};
  text-align: center;
  color: ${({ isActive, theme }) => getActiveColor(isActive || false, theme)};
  font-weight: 600;
  font-size: ${(props) => props.theme.fontSize.body.m};
`;

export const $StepTitle = styled.p<Props>`
  text-align: center;
  max-width: 90px;
  color: ${({ isActive, theme }) => getActiveColor(isActive || false, theme)};
  font-size: ${(props) => props.theme.fontSize.body.m};
  font-weight: ${(props) => (props.isActive ? 600 : 500)};
  grid-row: 2;
  align-self: start;
  margin-left: -22px;
`;

export const $Divider = styled.div<Props>`
  width: 72px;
  height: 2px;
  margin: 2px;
  background: ${({ isActive, theme }) =>
    getActiveColor(isActive || false, theme)};
`;

export const $StepContainer = styled.div<$StepContainerProps>`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  align-items: center;
`;

type AriaProps = {
  'aria-current'?:
    | boolean
    | 'time'
    | 'step'
    | 'false'
    | 'true'
    | 'page'
    | 'location'
    | 'date';
  'aria-label'?: string;
};

export const $StepItem = styled.div<AriaProps>`
  display: flex;
  align-items: center;
`;
