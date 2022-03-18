import styled from 'styled-components';

export const $PageContent = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;

  @media (min-width: ${(props) => props.theme.breakpoints.l}) {
    flex-flow: row nowrap;
  }
`;

export const $ImageWrapper = styled.div`
  width: 90%;

  @media (min-width: ${(props) => props.theme.breakpoints.l}) {
    width: 900px;
    flex-flow: row nowrap;
  }
`;

export const $Textbox = styled.div`
  background-color: ${(props) => props.theme.colors.tramLight};
  font-size: ${(props) => props.theme.fontSize.body.m};
  width: 80%;
  padding: ${(props) => props.theme.spacing.m} ${(props) => props.theme.spacing.s} ${(props) => props.theme.spacing.s};
  transform: translate(2%, -50%);

  @media (min-width: ${(props) => props.theme.breakpoints.s}) {
    font-size: ${(props) => props.theme.fontSize.body.l};
    padding: ${(props) => props.theme.spacing.xl3} ${(props) => props.theme.spacing.l};
    transform: translate(2%, -60%);
  }

  @media (min-width: ${(props) => props.theme.breakpoints.l}) {
    width: 18rem;
    height: 16rem;
    transform: translateX(-50%);
  }
`;

export const $TextboxTitle = styled.div`
  font-size: ${(props) => props.theme.fontSize.heading.m};
  margin-bottom: ${(props) => props.theme.spacing.l};

  @media (min-width: ${(props) => props.theme.breakpoints.s}) {
    font-size: ${(props) => props.theme.fontSize.heading.l};
    flex-flow: row nowrap;
  }
`;
