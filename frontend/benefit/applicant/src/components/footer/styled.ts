import { Footer } from 'hds-react';
import { Theme } from 'shared/styles/theme';
import styled, { ThemeProps } from 'styled-components';

type Props = ThemeProps<Theme>;

const StyledFooter = styled(Footer)`
  margin-top: ${(props: Props) => props.theme.spacing.xl} !important;
  --footer-background: ${(props: Props) =>
    props.theme.colors.black80} !important;
  --footer-color: ${(props: Props) => props.theme.colors.white} !important;
  --footer-divider-color: ${(props: Props) =>
    props.theme.colors.white} !important;
  --footer-focus-outline-color: ${(props: Props) =>
    props.theme.colors.white} !important;
`;

export { StyledFooter };
