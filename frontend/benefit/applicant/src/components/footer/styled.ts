import { Footer } from 'hds-react';
import { Theme } from 'shared/styles/theme';
import styled from 'styled-components';

const StyledFooter = styled(Footer)`
  margin-top:  ${props => (props.theme as Theme).spacing.xl} !important;
  --footer-background :  ${props => (props.theme as Theme).colors.black80} !important;
  --footer-color : ${props => (props.theme as Theme).colors.white} !important;
  --footer-divider-color : ${props => (props.theme as Theme).colors.white} !important;
  --footer-focus-outline-color :${props => (props.theme as Theme).colors.white} !important;
`;

export {
  StyledFooter
}