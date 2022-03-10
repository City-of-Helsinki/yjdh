import styled from 'styled-components';

export const $PostingCard = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-items: flex-start;
  font-size: ${(props) => props.theme.fontSize.heading.xl};
  margin-bottom: ${(props) => props.theme.spacing.xs};

  @media (min-width: ${(props) => props.theme.breakpoints.s}) {
    flex-flow: row nowrap;
    align-items: stretch;
  }
`;

export const $ImageContainer = styled.div`
  width: 100%;
  height: 250px;
  background-color: ${(props) => props.theme.colors.black10};
  display: flex;
  flex-flow: column nowrap;

  img {
    width: 100%;
  }

  @media (min-width: ${(props) => props.theme.breakpoints.s}) {
    width: 195px;
    height: 130px;
  }
`;

export const $PostingCardBody = styled.div`
  padding: ${(props) => props.theme.spacing.xs};
  display: inline-flex;
  flex-flow: column nowrap;
  justify-content: space-between;
  flex: 1;

  @media (min-width: ${(props) => props.theme.breakpoints.s}) {
    width: 100%;
  }
`;

export const $PostingHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

export const $PostingFooter = styled.div`
  display: flex;
  div {
    display: inline-flex;
    margin-right: ${(props) => props.theme.spacing.xl5};
    align-items: center;
  }
`;

export const $PostingFooterInfo = styled.span`
  font-size: ${(props) => props.theme.fontSize.body.l};
  padding-left: ${(props) => props.theme.spacing.xs2};
`;

export const $PostingDescription = styled.p`
  font-size: ${(props) => props.theme.fontSize.body.s};
  margin-top: 0;
  margin-bottom: ${(props) => props.theme.spacing.xs3};
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
`;

export const $PostingTitle = styled.h4`
  margin-top: 0;
  margin-bottom: ${(props) => props.theme.spacing.xs3};
  font-size: ${(props) => props.theme.fontSize.heading.s};
`;

export const $PostingDates = styled.div`
  width: 200px;
`;

export const $MenuContainer = styled.div`
  display: inline-flex;
  position: relative;
  align-self: flex-start;
`;
