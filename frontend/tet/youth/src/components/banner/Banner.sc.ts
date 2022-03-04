import styled from 'styled-components';

export const $Banner = styled.ul`
  margin-top: ${(props) => props.theme.spacing.m};
  background-color: ${(props) => props.theme.colors.suomenlinna};
  height: 32rem;
`;

export const $BannerWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  height: 32rem;
`;

export const $Title = styled.h1`
  width: 50%;
  font-size: ${(props) => props.theme.fontSize.heading.xl};
  padding: ${(props) => props.theme.spacing.xl};
  color: ${(props) => props.theme.colors.white};
`;

export const $ImageWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-end;
  width: 50%;
  height: 100%;

  img {
    width: 100%;
    padding-bottom: 4.7rem;
  }
`;
