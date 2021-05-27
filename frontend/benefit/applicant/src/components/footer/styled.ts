import styled from 'styled-components';
import { Footer } from 'hds-react';
import React from 'react';

const StyledFooter = styled(Footer)`
  --footer-background :  ${props => props.theme.colors.black80} !important;
  --footer-color : ${props => props.theme.colors.white} !important;
  --footer-divider-color : ${props => props.theme.colors.white} !important;
  --footer-focus-outline-color :${props => props.theme.colors.white} !important;
`;

export {
  StyledFooter
}