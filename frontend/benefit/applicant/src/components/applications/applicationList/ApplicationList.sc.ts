import { respondAbove } from 'shared/styles/mediaQueries';
import styled, { DefaultTheme } from 'styled-components';

export const $HeadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;

  ${respondAbove('sm')`
    flex-direction: row;
    align-items: center;
  `}
`;

export const $Heading = styled.h2`
  font-size: ${(props: { theme: DefaultTheme }) =>
    props.theme.fontSize.heading.m};
  font-weight: 500;
  flex: 1 1 100%;
`;

export const $OrderByContainer = styled.div`
  flex: 0;
  margin-bottom: ${(props: { theme: DefaultTheme }) => props.theme.spacing.xs};
  ${respondAbove('sm')`
    flex: 1 0 300px;
  `}
`;

export const $ListWrapper = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${(props: { theme: DefaultTheme }) => props.theme.spacing.xs2};
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const $PaginationContainer = styled.div`
  margin-top: ${(props: { theme: DefaultTheme }) => props.theme.spacing.xl2};
`;

export const $ListActionButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin: ${(props: { theme: DefaultTheme }) => props.theme.spacing.xs};
`;
