import styled from 'styled-components';

export const $Menu = styled.div`
  border: 1px solid rgba(0, 0, 0, 0.1);
  user-select: none;
  font-size: 14px;
  padding: ${(props) => props.theme.spacing.xs3} ${(props) => props.theme.spacing.xs};
  width: 150px;
  top: 35px;
  right: -10px;
  position: absolute;
  background-color: #fff;
  z-index: 10;

  ul {
    padding: 0;
  }
`;

export const $MenuItem = styled.li`
  display: flex;
  align-items: center;
  padding-bottom: ${(props) => props.theme.spacing.xs};
  padding-top: ${(props) => props.theme.spacing.xs};
  cursor: pointer;

  &:first-child {
    padding-top: 0;
  }

  &:last-child {
    padding-bottom: 0;
  }

  &:hover {
    color: ${(props) => props.theme.colors.black60};
  }

  span {
    font-size: ${(props) => props.theme.fontSize.body.m};
    margin-left: ${(props) => props.theme.spacing.xs2};
  }
`;
