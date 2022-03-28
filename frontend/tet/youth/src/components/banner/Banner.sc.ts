import styled from 'styled-components';

export const $Banner = styled.div`
  background-color: ${(props) => props.theme.colors.suomenlinna};
  height: 22rem;

  @media (min-width: ${(props) => props.theme.breakpoints.s}) {
    height: 32rem;
  }
`;

export const $BannerWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  height: 22rem;

  @media (min-width: ${(props) => props.theme.breakpoints.s}) {
    height: 32rem;
  }
`;

export const $Title = styled.h1`
  width: 80%;
  font-size: ${(props) => props.theme.fontSize.heading.l};
  padding: ${(props) => props.theme.spacing.xl};
  color: ${(props) => props.theme.colors.white};

  @media (min-width: ${(props) => props.theme.breakpoints.s}) {
    font-size: ${(props) => props.theme.fontSize.heading.xl};
    width: 50%;
  }
`;

export const $ImageWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-end;
  width: 50%;
  height: 100%;

  img {
    display: none;
    width: 100%;
    padding-bottom: 5.7rem;

    @media (min-width: ${(props) => props.theme.breakpoints.s}) {
      display: block;
    }
  }
`;
