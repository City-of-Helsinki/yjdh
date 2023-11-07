import { $Grid } from 'shared/components/forms/section/FormSection.sc';
import styled from 'styled-components';

type HandledHrProps = {
  dashed?: boolean;
};

type HandledRowProps = {
  largeMargin?: boolean;
};

export const $HandledSection = styled.div`
  background-color: ${(props) => props.theme.colors.coatOfArmsLight};
  border: 2px solid ${(props) => props.theme.colors.coatOfArmsMediumLight};
  position: relative;
  grid-column: 1 / span 12;
  padding: ${(props) => props.theme.spacing.xl}
    ${(props) => props.theme.spacing.xl5};
`;

export const $HandledHr = styled.hr<HandledHrProps>`
  border-top: 1px ${(props) => (props.dashed ? 'dashed' : 'solid')}
    ${(props) => props.theme.colors.coatOfArms};
  margin: ${(props) => props.theme.spacing.l} 0;
`;

export const $HandledRow = styled($Grid)<HandledRowProps>`
  gap: 0;
  margin: ${(props) =>
      props.largeMargin ? props.theme.spacing.l : props.theme.spacing.s}
    0;
`;

export const $HandledHeader = styled.div`
  display: flex;
  justify-content: space-between;
`;
