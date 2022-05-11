import styled from 'styled-components';

export const $ContentWrapper = styled.div`
  display: flex;
  flex-flow: row wrap;

  @media (min-width: ${(props) => props.theme.breakpoints.l}) {
    flex-wrap: nowrap;
  }
`;

export const $Body = styled.div`
  width: 100%;
  font-size: ${(props) => props.theme.fontSize.body.l};
  font-weight: normal;
  line-height: ${(props) => props.theme.lineHeight.l};
  white-space: pre-wrap;

  @media (min-width: ${(props) => props.theme.breakpoints.l}) {
    width: 60%;
  }
`;

export const $InfoWrapper = styled.div`
  @media (min-width: ${(props) => props.theme.breakpoints.l}) {
    padding: ${(props) => props.theme.spacing.l};
    width: 40%;
  }
`;

export const $Title = styled.h3`
  font-size: ${(props) => props.theme.fontSize.heading.m};
`;

export const $Hr = styled.hr`
  border: none;
  border-top: 1px solid ${(props) => props.theme.colors.black20};
  margin-top: ${(props) => props.theme.spacing.xl};
  margin-bottom: ${(props) => props.theme.spacing.xl};
  width: 100%;
`;
