import styled from 'styled-components';

export const $PostingCard = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-items: flex-start;
  background-color: ${(props) => props.theme.colors.black5};
  margin-bottom: ${(props) => props.theme.spacing.m};
  cursor: pointer;

  @media (min-width: ${(props) => props.theme.breakpoints.m}) {
    flex-flow: row nowrap;
    align-items: stretch;
  }
`;

export const $ImageContainer = styled.div`
  width: 100%;
  height: 300px;
  background-color: ${(props) => props.theme.colors.black10};
  display: flex;
  flex-flow: column nowrap;

  img {
    width: 100%;
  }

  @media (min-width: ${(props) => props.theme.breakpoints.m}) {
    width: 400px;
    height: 100%;
  }
`;

export const $PostingCardBody = styled.div`
  padding: ${(props) => props.theme.spacing.xs};
  display: inline-flex;
  flex-flow: column nowrap;
  justify-content: space-between;
  flex: 1;

  @media (min-width: ${(props) => props.theme.breakpoints.m}) {
    width: 100%;
  }
`;

export const $PostingCardBodyFooter = styled.div`
  display: inline-flex;
  justify-content: flex-end;
`;

export const $PostingDescription = styled.p`
  font-size: ${(props) => props.theme.fontSize.body.m};
  overflow: hidden;
  width: 100%;
  margin-bottom: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  line-height: ${(props) => props.theme.lineHeight.xl};
  font-weight: regular;
`;

export const $PostingLanguages = styled.div`
  font-size: ${(props) => props.theme.fontSize.body.m};

  span {
    font-weight: bold;
  }
`;

export const $PostingTitle = styled.h4`
  margin-top: 0;
  margin-bottom: ${(props) => props.theme.spacing.xs3};
  font-size: ${(props) => props.theme.fontSize.heading.s};
`;

export const $PostingSubtitle = styled.h6`
  margin-top: 0;
  margin-bottom: ${(props) => props.theme.spacing.xs3};
  font-size: ${(props) => props.theme.fontSize.heading.xxs};
`;

export const $PostingDate = styled.div`
  font-size: ${(props) => props.theme.fontSize.body.l};
  font-weight: normal;
`;

export const $ButtonLink = styled.a`
  text-decoration: none;
`;

export const $PostingAddress = styled.div`
  margin-top: 0;
  margin-bottom: ${(props) => props.theme.spacing.xs3};
  font-size: ${(props) => props.theme.fontSize.body.s};
  font-weight: normal;
`;
