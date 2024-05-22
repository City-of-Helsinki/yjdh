import styled from 'styled-components';

export const $Heading = styled.h1`
  display: inline-block;
  font-size: ${(props) => props.theme.fontSize.heading.xl};
  font-weight: normal;
`;

export const $Subheading = styled.h2`
  display: inline-block;
  font-size: ${(props) => props.theme.fontSize.heading.s};
  font-weight: normal;
  margin: ${(props) => props.theme.spacing.s} 0;

  strong {
    font-weight: 500;
  }
`;

export const $EmptyListText = styled.p`
  font-size: ${(props) => props.theme.fontSize.heading.l};
  font-weight: normal;
  margin: 0;
`;

export const $Link = styled.a`
  color: ${(props) => props.theme.colors.coatOfArms};
  text-decoration: none;
  font-weight: 500;
`;
