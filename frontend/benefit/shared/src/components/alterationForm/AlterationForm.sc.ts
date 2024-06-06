import { respondAbove } from 'shared/styles/mediaQueries';
import styled from 'styled-components';

export const $Section = styled.section`
  margin-bottom: ${(props) => props.theme.spacing.xl};
`;

export const $SaveActionFormErrorText = styled.div`
  ${respondAbove('sm')`
    text-align: right;
  `};

  display: flex;
  align-items: center;
  color: ${(props) => props.theme.colors.error};
  svg {
    width: 48px;
    fill: ${(props) => props.theme.colors.error};
  }
`;

export const $H2 = styled.h2`
  margin: 0;
`;
