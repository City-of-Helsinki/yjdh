import styled from 'styled-components';

export const $Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: ${(props) => props.theme.spacing.m};
  font-size: ${(props) => props.theme.fontSize.body.m};
`;

export const $Title = styled.span`
  display: flex;
  background-color: ${(props) => props.theme.colors.coatOfArmsLight};
  border-bottom: 1px dashed ${(props) => props.theme.colors.coatOfArms};
  padding: ${(props) => props.theme.spacing.xs};
  cursor: pointer;
`;

export const $ActionContainer = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  margin-left: ${(props) => props.theme.spacing.l};
`;
