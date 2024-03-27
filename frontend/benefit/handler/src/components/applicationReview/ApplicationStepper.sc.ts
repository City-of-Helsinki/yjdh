import styled from 'styled-components';

export const $ApplicationStepperWrapper = styled.div`
  h1 {
    margin: 0 0 ${(props) => props.theme.spacing.m}
      ${(props) => props.theme.spacing.xs2};
  }

  hr {
    border: 1px solid ${(props) => props.theme.colors.silver};
    margin-top: ${(props) => props.theme.spacing.m};
  }
`;
