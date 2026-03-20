import React, { PropsWithChildren } from 'react';
import styled, { DefaultTheme } from 'styled-components';

type Props = {
  count: number;
};

const $NumberTag = styled.div`
  min-width: ${(props: { theme: DefaultTheme }) => props.theme.spacing.s};
  height: ${(props: { theme: DefaultTheme }) => props.theme.spacing.s};
  display: inline-flex;
  justify-content: center;
  align-items: center;
  padding: ${(props: { theme: DefaultTheme }) => props.theme.spacing.xs2};
  border-radius: ${(props: { theme: DefaultTheme }) => props.theme.spacing.s};
  background-color: ${(props: { theme: DefaultTheme }) =>
    props.theme.colors.coatOfArms};
  color: ${(props: { theme: DefaultTheme }) => props.theme.colors.white};
  margin-left: ${(props: { theme: DefaultTheme }) => props.theme.spacing.xs2};
`;

const NumberTag: React.FC<PropsWithChildren<Props>> = ({ count }) => (
  <$NumberTag>
    <span>{count}</span>
  </$NumberTag>
);

export default NumberTag;
