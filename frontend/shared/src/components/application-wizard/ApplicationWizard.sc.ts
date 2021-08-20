import styled from 'styled-components';

export const $Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${(props) => props.theme.spacing.m};
  margin-top: ${(props) => props.theme.spacing.xs};
  & > div {
    flex: 1 0 50%;
  }
`;

export const $HeaderItem = styled.div``;

export const $Heading = styled.h1`
  font-size: ${(props) => props.theme.fontSize.heading.xl};
  font-weight: normal;
  margin: 0;
`;
