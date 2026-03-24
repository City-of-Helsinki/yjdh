import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: { [key: string]: string };
    fonts: { [key: string]: string };
    fontSize: {
      heading: { [key: string]: string };
      body: { [key: string]: string };
    };
    containerWidth: { [key: string]: string };
    spacing: { [key: string]: string };
    spacingLayout: { [key: string]: string };
    lineHeight: { [key: string]: string };
    breakpoints: { [key: string]: string };
    headerWidth: { [key: string]: string };
    contentWidth: { [key: string]: string };
    components: { [key: string]: any };
  }
}
