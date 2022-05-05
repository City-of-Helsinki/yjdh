import styled, { DefaultTheme } from 'styled-components';

type Props = { isActive?: boolean };

type $StepContainerProps = Props & {
  activeStep?: number;
};

const getActiveColor = (isActive: boolean, theme: DefaultTheme): string =>
  isActive ? theme.colors.black90 : theme.colors.black20;

export const $StepsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  align-items: center;
`;

export const $StepContainer = styled.div<$StepContainerProps>`
  display: flex;
  align-items: center;
  flex-direction: column;
  z-index: 1;
  cursor: ${({ isActive }) => (isActive ? 'pointer' : 'auto')};
`;

export const $StepCircle = styled.div<Props>`
  height: 36px;
  width: 36px;
  border-radius: 50%;
  border: 4px solid
    ${({ isActive, theme }) => getActiveColor(isActive || false, theme)};
  text-align: center;
  color: ${({ isActive, theme }) => getActiveColor(isActive || false, theme)};
  font-weight: 600;
  line-height: 36px;
  font-size: ${(props) => props.theme.fontSize.body.m};
  justify-self: center;
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
  height: 4px;
  margin: 4px;
  background: ${({ isActive, theme }) =>
    getActiveColor(isActive || false, theme)};
`;
