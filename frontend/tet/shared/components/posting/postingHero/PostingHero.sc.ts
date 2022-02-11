import styled from 'styled-components';

interface ImageProps {
  imageUrl: string;
}

export const $PostingHero = styled.div`
  background-color: ${(props) => props.theme.colors.black10};
  width: 100%;
`;

export const $HeroWrapper = styled.div`
  display: flex;
`;

export const $ImageContainer = styled.div<ImageProps>`
  width: 100%;
  height: 300px;
  background-color: ${(props) => props.theme.colors.black30};
  background: url('${(props) => props.imageUrl || ''}') no-repeat center center;
  background-size: cover;
  @media (min-width: ${(props) => props.theme.breakpoints.s}) {
    width: 60%;
    height: 500px;
  }
`;

export const $HeroContentWrapper = styled.div`
  padding: ${(props) => props.theme.spacing.l};
`;

export const $Keywords = styled.ul`
  display: flex;
  flex-flow: row wrap;
  list-style: none;
  padding-left: 0;
`;

export const $Title = styled.h1`
  font-size: ${(props) => props.theme.fontSize.heading.l};
`;

export const $Subtitle = styled.h1`
  font-size: ${(props) => props.theme.fontSize.body.l};
`;
export const $Date = styled.div`
  font-size: ${(props) => props.theme.fontSize.body.l};
  font-weight: normal;
`;
export const $Address = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  margin-top: ${(props) => props.theme.spacing.m};
  margin-bottom: ${(props) => props.theme.spacing.xl4};
`;
