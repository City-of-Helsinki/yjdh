import { Theme } from 'shared/styles/theme';
import styled, { ThemeProps } from 'styled-components';

type Props = ThemeProps<Theme> & { isActive?: boolean };

interface StyledStepContainerProps {
  activeStep?: number;
}

const getActiveColor = (isActive: boolean, theme: Theme): string =>
  isActive ? theme.colors.black90 : theme.colors.black20;

const StyledStepsContainer = styled.div`
  display: flex;
  align-items: center;
`;

const StyledStepContainer = styled.div<StyledStepContainerProps>`
  display: flex;
  align-items: center;
  flex-direction: column;
  position: relative;
  z-index: 1;
`;

const StyledStepCircle = styled.div<Props>`
  height: 36px;
  width: 36px;
  border-radius: 50%;
  border: 4px solid
    ${({ isActive, theme }: Props) => getActiveColor(isActive || false, theme)};
  text-align: center;
  color: ${({ isActive, theme }: Props) =>
    getActiveColor(isActive || false, theme)};
  font-weight: 600;
  position: relative;
  line-height: 36px;
  font-size: ${(props: Props) => props.theme.fontSize.body.m};
`;

const StyledStepTitle = styled.p<Props>`
  text-align: center;
  position: absolute;
  bottom: -40px;
  color: ${({ isActive, theme }: Props) =>
    getActiveColor(isActive || false, theme)};
  font-size: ${(props: Props) => props.theme.fontSize.body.m};
  font-weight: ${(props: Props) => (props.isActive ? 600 : 500)};
`;

const StyledDivider = styled.div<Props>`
  width: 100%;
  height: 2px;
  margin: 4px;
  background: ${({ isActive, theme }: Props) =>
    getActiveColor(isActive || false, theme)};
  flex: 1;
`;

export {
  StyledDivider,
  StyledStepCircle,
  StyledStepContainer,
  StyledStepsContainer,
  StyledStepTitle,
};
