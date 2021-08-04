import { Footer } from 'hds-react';
import $ from 'styled-components';

export const $Footer = $(Footer)`
  margin-top: ${(props) => props.theme.spacing.xl} !important;
  --footer-background: ${(props) => props.theme.colors.black80} !important;
  --footer-color: ${(props) => props.theme.colors.white} !important;
  --footer-divider-color: ${(props) => props.theme.colors.white} !important;
  --footer-focus-outline-color: ${(props) =>
    props.theme.colors.white} !important;
`;
