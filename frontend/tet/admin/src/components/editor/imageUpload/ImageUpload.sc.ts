import styled from 'styled-components';

export const $ImageContainer = styled.div`
  width: 100%;
  background-color: ${(props) => props.theme.colors.black30};

  @media (min-width: ${(props) => props.theme.breakpoints.l}) {
    width: 60%;
  }
`;

export const $PhotographerField = styled.div`
  margin-top: ${(props) => props.theme.spacing.m};
`;

export const $ButtonContainer = styled.div`
  margin-top: ${(props) => props.theme.spacing.m};
`;

export const $SpinnerWrapper = styled.div`
  display: flex;
  flex-flow: column;
  justify-content: center;
  min-height: 300px;
`;
