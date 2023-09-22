import styled from 'styled-components';

export const $Wrapper = styled.section`
  margin-bottom: ${(props) => props.theme.spacing.xs2};
  h2 {
    font-size: ${(props) => props.theme.fontSize.heading.m};
    margin: ${(props) => props.theme.spacing.s} 0;
  }
`;
