import { Footer } from 'hds-react';
import styled from 'styled-components';

const StyledFooter = styled(Footer)`
  margin-top: ${(props) => props.theme.spacing.xl} !important;
  --footer-background: ${(props) => props.theme.colors.black80} !important;
  --footer-color: ${(props) => props.theme.colors.white} !important;
  --footer-divider-color: ${(props) => props.theme.colors.white} !important;
  --footer-focus-outline-color: ${(props) =>
    props.theme.colors.white} !important;
`;

export { StyledFooter };
