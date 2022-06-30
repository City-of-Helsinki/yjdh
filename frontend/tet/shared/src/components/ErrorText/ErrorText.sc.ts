import styled from 'styled-components';

export const $ErrorTextWrapper = styled.div`
  display: flex;
  flex-flow: column;
  justify-content: center;
  padding-top: ${(props) => props.theme.spacing.xl};

  div {
    font-size: ${(props) => props.theme.fontSize.heading.l};
    text-align: center;
  }
`;
