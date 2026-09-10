import theme from 'shared/styles/theme';
import { createGlobalStyle } from 'styled-components';

const HandlerGlobalStyle = createGlobalStyle`
  [class*='Tooltip-module_tooltip'] {
    border: 1px solid ${theme.colors.black20};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

export default HandlerGlobalStyle;
