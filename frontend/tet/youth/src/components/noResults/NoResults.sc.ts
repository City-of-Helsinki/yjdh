import styled from 'styled-components';

export const $NoResultsWrapper = styled.div`
  display: flex;
  flex-flow: column;
  justify-content: center;
`;

export const $Title = styled.h1`
  font-size: ${(props) => props.theme.fontSize.heading.m};
  text-align: center;
`;

export const $Links = styled.div`
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;
  text-transform: capitalize;
`;
