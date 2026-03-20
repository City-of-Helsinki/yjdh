import 'styled-components';

interface ComponentTheme {
  [key: string]: string | Record<string, string>;
}

interface Theme {
  colors: {
    [key: string]: string;
  };
  spacing: {
    [key: string]: string;
  };
  spacingLayout: {
    [key: string]: string;
  };
  fontSize: {
    body: {
      s: string;
      m: string;
      l: string;
      xl: string;
    };
    heading: {
      xs: string;
      s: string;
      m: string;
      l: string;
      xl: string;
    };
  };
  lineHeight: {
    [key: string]: string;
  };
  components: {
    [key: string]: ComponentTheme;
  };
}

declare module 'styled-components' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface DefaultTheme extends Theme {}
}
