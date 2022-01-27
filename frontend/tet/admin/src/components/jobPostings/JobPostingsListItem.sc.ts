import styled from 'styled-components';

export const $PostingCard = styled.div`
  display: flex;
  font-size: ${(props) => props.theme.fontSize.heading.xl};
  margin-bottom: ${(props) => props.theme.spacing.xs};
`;

export const $ImageContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
  width: 195px;
  height: 130px;
  background-color: ${(props) => props.theme.colors.black10};
`;

export const $PostingCardBody = styled.div`
  padding: ${(props) => props.theme.spacing.s};
  display: flex;
  width: 100%;
  flex-direction: column;
  justify-content: space-between;
  flex-grow: 1;
`;

export const $PostingHeader = styled.div`
  display: flex;
  justify-content: space-between;
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
`;

export const $PostingTitle = styled.h4`
  margin-top: 0;
  margin-bottom: ${(props) => props.theme.spacing.xs3};
  font-size: ${(props) => props.theme.fontSize.heading.s};
`;

export const $MenuContainer = styled.div`
  position: relative;
`;
