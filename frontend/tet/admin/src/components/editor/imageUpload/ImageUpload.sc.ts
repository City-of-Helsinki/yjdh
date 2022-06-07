import styled from 'styled-components';
import { ImageProps } from 'next/image';

export const $ImageContainer = styled.div<ImageProps>`
  width: 100%;
  background-color: ${(props) => props.theme.colors.black30};
  background-size: cover;

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
