import styled, { DefaultTheme } from 'styled-components';

export const $CalculationReviewTableWrapper = styled.div`
  max-width: 714px;
  margin-top: ${(props: { theme: DefaultTheme }) => props.theme.spacing.xs};

  caption {
    font-weight: 500;
  }

  table > tbody > tr:last-child td {
    background-color: ${(props: { theme: DefaultTheme }) =>
      props.theme.colors.coatOfArmsLight};
    font-weight: 600;
  }
`;
