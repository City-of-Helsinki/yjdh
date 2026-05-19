import { Link, LinkProps } from 'hds-react';
import styled from 'styled-components';

export const $OpenInNewTabLink = styled(Link)<LinkProps>`
  ${({ openInNewTab }) =>
    openInNewTab &&
    `
        span {
          display: none;
        }
    `}
`;
