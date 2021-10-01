import styled from 'styled-components';

export const $Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: ${(props) => props.theme.spacing.m};
  font-size: ${(props) => props.theme.fontSize.body.m};
`;

export const $Title = styled.a`
  display: flex;
  background-color: ${(props) => props.theme.colors.coatOfArmsLight};
  border-bottom: 1px dashed ${(props) => props.theme.colors.coatOfArms};
  &:focus {
    outline: 3px solid ${(props) => props.theme.colors.coatOfArms};
  }
  padding: ${(props) => props.theme.spacing.xs};
  color: ${(props) => props.theme.colors.black};
  text-decoration: none;
  cursor: pointer;
`;

export const $ActionContainer = styled.a`
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  margin-left: ${(props) => props.theme.spacing.l};
  &:focus {
    outline: 3px solid ${(props) => props.theme.colors.coatOfArms};
  }
  color: ${(props) => props.theme.colors.black};
  text-decoration: none;
  padding: ${(props) => props.theme.spacing.xs};
  min-width: 120px;
`;
