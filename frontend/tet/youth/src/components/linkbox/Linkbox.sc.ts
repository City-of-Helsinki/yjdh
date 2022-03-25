import styled from 'styled-components';

export const $Linkbox = styled.div`
  width: 100%;
  @media (min-width: ${(props) => props.theme.breakpoints.s}) {
    max-width: 400px;
  }
`;

export const $TitleWrapper = styled.a`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: inherit;
`;

export const $TitleText = styled.div`
  text-decoration: underline;
  font-size: ${(props) => props.theme.fontSize.heading.m};
`;

export const $BoxContent = styled.div`
  font-size: ${(props) => props.theme.fontSize.body.l};
  color: ${(props) => props.theme.colors.black60};
`;
