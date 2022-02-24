import styled from 'styled-components';

export const $PostingCard = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-items: flex-start;
  background-color: ${(props) => props.theme.colors.black5};
  margin-bottom: ${(props) => props.theme.spacing.m};

  @media (min-width: ${(props) => props.theme.breakpoints.s}) {
    flex-flow: row nowrap;
    align-items: stretch;
  }
`;

export const $ImageContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  width: 100%;
  height: 250px;
  align-items: center;
  background-color: ${(props) => props.theme.colors.black10};

  @media (min-width: ${(props) => props.theme.breakpoints.s}) {
    width: 380px;
    min-height: 14.5rem;
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

export const $PostingCardBodyFooter = styled.div`
  display: inline-flex;
  justify-content: flex-end;
`;

export const $PostingDescription = styled.p`
  font-size: ${(props) => props.theme.fontSize.body.m};
  line-height: ${(props) => props.theme.lineHeight.xl};
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

export const $PostingAddress = styled.div`
  margin-top: 0;
  margin-bottom: ${(props) => props.theme.spacing.xs3};
  font-size: ${(props) => props.theme.fontSize.body.s};
  font-weight: normal;
`;
