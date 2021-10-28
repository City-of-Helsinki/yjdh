import styled from 'styled-components';

export const $Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: ${(props) => props.theme.spacing.m};
  height: 100%;
`;

export const $HeadingContainer = styled.div`
  display: flex;
  box-sizing: border-box;
`;

export const $Heading = styled.h1`
  display: inline-block;
  font-size: ${(props) => props.theme.fontSize.heading.xl};
  font-weight: normal;
`;

export const $ActionContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 100%;
`;
