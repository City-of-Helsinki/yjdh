import styled from 'styled-components';

type Props = { backgroundColor?: string };

export const $EmployerBasicInfo = styled.div<Props>`
  display: grid;
  grid-template-columns: 50% 50%;
  grid-template-rows: 50% 50%;
  grid-gap: ${(props) => props.theme.spacing.xs};
  align-items: center;
  font-size: ${(props) => props.theme.fontSize.body.m};
  margin-bottom: ${(props) => props.theme.spacing.xs};
  background-color: ${(props) => props.backgroundColor};
`;
