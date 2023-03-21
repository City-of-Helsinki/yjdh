import styled from 'styled-components';

export const $Heading = styled.h2`
  font-size: ${(props) => props.theme.fontSize.heading.s};
`;

export const $Empty = styled.div`
  background-color: ${(props) => props.theme.colors.black5};
  color: ${(props) => props.theme.colors.black50};
  padding: ${(props) => props.theme.spacing.s};
`;

export const $EmptyHeading = styled.h2`
  font-weight: 400;
`;

export const $CellContent = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${(props) => props.theme.colors.white};
`;
