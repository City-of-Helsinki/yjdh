import styled from 'styled-components';

export const $ContentWrapper = styled.div`
  display: flex;
  flex-flow: row wrap;
`;

export const $Body = styled.div`
  width: 100%;
  font-size: ${(props) => props.theme.fontSize.body.l};
  font-weight: normal;
  line-height: ${(props) => props.theme.lineHeight.l};

  @media (min-width: ${(props) => props.theme.breakpoints.s}) {
    width: 60%;
  }
`;

export const $InfoWrapper = styled.div`
  padding: ${(props) => props.theme.spacing.l};
`;

export const $Title = styled.h3`
  font-size: ${(props) => props.theme.fontSize.heading.m};
`;
