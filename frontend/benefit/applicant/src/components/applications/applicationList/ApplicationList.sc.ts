import { respondAbove } from 'shared/styles/mediaQueries';
import styled from 'styled-components';

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
  font-size: ${(props) => props.theme.fontSize.heading.m};
  font-weight: 500;
  flex: 1 1 100%;
`;

export const $OrderByContainer = styled.div`
  flex: 0;
  margin-bottom: ${(props) => props.theme.spacing.xs};
  ${respondAbove('sm')`
    flex: 1 0 300px;
  `}
`;

export const $ListWrapper = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.xs2};
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const $PaginationContainer = styled.div`
  margin-top: ${(props) => props.theme.spacing.xl2};
`;

export const $ListActionButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin: ${(props) => props.theme.spacing.xs};
`;
