import styled from 'styled-components';

export const $InfoItem = styled.div`
  margin-bottom: ${(props) => props.theme.spacing.xl};
`;

export const $Header = styled.h3`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  font-size: ${(props) => props.theme.fontSize.heading.xs};
`;

export const $Title = styled.span`
  margin-left: ${(props) => props.theme.spacing.m};
`;

export const $List = styled.ul`
  list-style: none;
  padding-left: 0;

  li {
    font-size: ${(props) => props.theme.fontSize.body.l};
    padding-top: ${(props) => props.theme.spacing.xs};
  }
`;
