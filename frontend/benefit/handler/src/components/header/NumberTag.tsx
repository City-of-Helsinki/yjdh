import React, { PropsWithChildren } from 'react';
import styled from 'styled-components';

type Props = {
  count: number;
};

const $NumberTag = styled.div`
  min-width: ${(props) => props.theme.spacing.s};
  height: ${(props) => props.theme.spacing.s};
  display: inline-flex;
  justify-content: center;
  align-items: center;
  padding: ${(props) => props.theme.spacing.xs2};
  border-radius: ${(props) => props.theme.spacing.s};
  background-color: ${(props) => props.theme.colors.coatOfArms};
  color: ${(props) => props.theme.colors.white};
  margin-left: ${(props) => props.theme.spacing.xs2};
`;

const NumberTag: React.FC<PropsWithChildren<Props>> = ({ count }) => (
  <$NumberTag>
    <span>{count}</span>
  </$NumberTag>
);

export default NumberTag;
