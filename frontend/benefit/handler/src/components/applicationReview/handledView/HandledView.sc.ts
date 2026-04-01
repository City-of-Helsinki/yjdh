import { $Grid } from 'shared/components/forms/section/FormSection.sc';
import styled, { DefaultTheme } from 'styled-components';

type HandledHrProps = {
  dashed?: boolean;
  theme: DefaultTheme;
};

type HandledRowProps = {
  largeMargin?: boolean;
  theme: DefaultTheme;
};

export const $HandledSection = styled.div`
  background-color: ${(props: { theme: DefaultTheme }) =>
    props.theme.colors.coatOfArmsLight};
  border: 2px solid
    ${(props: { theme: DefaultTheme }) =>
      props.theme.colors.coatOfArmsMediumLight};
  position: relative;
  grid-column: 1 / span 12;
  padding: ${(props: { theme: DefaultTheme }) => props.theme.spacing.xl}
    ${(props: { theme: DefaultTheme }) => props.theme.spacing.xl5};
`;

export const $HandledHr = styled.hr<HandledHrProps>`
  border-top: 1px
    ${(props: HandledHrProps) => (props.dashed ? 'dashed' : 'solid')}
    ${(props: HandledHrProps) => props.theme.colors.coatOfArms};
  margin: ${(props: HandledHrProps) => props.theme.spacing.l} 0;
`;

export const $HandledRow = styled($Grid)<HandledRowProps>`
  gap: 0;
  margin: ${(props: HandledRowProps) =>
      props.largeMargin ? props.theme.spacing.l : props.theme.spacing.s}
    0;
`;

export const $HandledHeader = styled.div`
  display: flex;
  justify-content: space-between;
`;
