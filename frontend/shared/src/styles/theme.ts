type Colors = {
  [key: string]: string;
}

type Fonts = {
  [key: string]: string;
}

type Body = {
  [key: string]: string;
}

type Heading = {
  [key: string]: string;
}

type FontSize = {
  body: Body;
  heading: Heading;
}

type ContainerWidth = {
  [key: string]: string;
}

type Spacing = {
  [key: string]: string;
}

type SpacingLayout = {
  [key: string]: string;
}

type LineHeight = {
  [key: string]: number;
}

export interface Theme {
  colors: Colors;
  fonts: Fonts;
  fontSize: FontSize;
  containerWidth: ContainerWidth;
  spacing: Spacing;
  spacingLayout: SpacingLayout;
  lineHeight: LineHeight;
}

const theme: Theme = {
  colors: {
    brick: '#bd2719',
    brickLight: '#ffeeed',
    brickMediumLight: '#facbc8',
    brickDark: '#800e04',
    bus: '#0000bf',
    busLight: '#f0f0ff',
    busMediumLight: '#ccf',
    busDark: '#00005e',
    coatOfArms: '#0072c6',
    coatOfArmsLight: '#e6f4ff',
    coatOfArmsMediumLight: '#b5daf7',
    coatOfArmsDark: '#005799',
    copper: '#00d7a7',
    copperLight: '#cffaf1',
    copperMediumLight: '#9ef0de',
    copperDark: '#00a17d',
    engel: '#ffe977',
    engelLight: '#fff9db',
    engelMediumLight: '#fff3b8',
    engelDark: '#dbc030',
    fog: '#9fc9eb',
    fogLight: '#e8f3fc',
    fogMediumLight: '#d0e6f7',
    fogDark: '#72a5cf',
    gold: '#c2a251',
    goldLight: '#f7f2e4',
    goldMediumLight: '#e8d7a7',
    goldDark: '#9e823c',
    metro: '#fd4f00',
    metroLight: '#ffeee6',
    metroMediumLight: '#ffcab3',
    metroDark: '#bd2f00',
    silver: '#dedfe1',
    silverLight: '#f7f7f8',
    silverMediumLight: '#efeff0',
    silverDark: '#b0b8bf',
    summer: '#ffc61e',
    summerLight: '#fff4d4',
    summerMediumLight: '#ffe49c',
    summerDark: '#cc9200',
    suomenlinna: '#f5a3c7',
    suomenlinnaLight: '#fff0f7',
    suomenlinnaMediumLight: '#ffdbeb',
    suomenlinnaDark: '#e673a5',
    tram: '#009246',
    tramLight: '#dff7eb',
    tramMediumLight: '#a3e3c2',
    tramDark: '#006631',
    black: '#000',
    white: '#fff',
    black5: '#f1f1f1',
    black10: '#e5e5e5',
    black20: '#ccc',
    black30: '#b2b2b2',
    black40: '#999898',
    black50: 'grey',
    black60: '#666',
    black70: '#4c4c4c',
    black80: '#333',
    black90: '#1a1a1a',
    error: '#b01038',
    errorLight: '#f6e2e6',
    errorDark: '#8d0d2d',
    success: '#007a64',
    successLight: '#e2f5f3',
    successDark: '#006250',
    alert: '#ffda07',
    alertLight: '#fff4b4',
    alertDark: '#d18200',
    info: '#0062b9',
    infoLight: '#e5eff8',
    infoDark: '#004f94',
  },
  fonts: {
    helGrotesk: `'HelsinkiGrotesk', Arial, -apple-system, BlinkMacSystemFont,
    'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans',
    'Droid Sans', 'Helvetica Neue', sans-serif;`
  },
  fontSize: {
    heading: {
      xl: '3.25rem',
      l: '2.25rem',
      m: '1.5rem',
      s: '1.25rem',
      xs: '1.125rem',
      xxs: '1rem',
    },
    body: {
      s: '0.875rem',
      m: '1rem',
      l: '1.125rem',
      xl: '1.25rem',
    }
  },
  containerWidth: {
    xs: '288px',
    s: '544px',
    m: '720px',
    l: '944px',
    xl: '1200px',
  },
  spacing: {
    xs2: '1rem',
    xs: '1.5rem',
    s: '2rem',
    m: '3rem',
    l: '4rem',
    xl: '6rem',
    xl2: '8rem',
  },
  spacingLayout: {
    xs4: '0.125rem',
    xs3: '0.25rem',
    xs2: '0.5rem',
    xs: '0.75rem',
    s: '1rem',
    m: '1.5rem',
    l: '2rem',
    xl: '2.5rem',
    xl2: '3.0rem',
    xl3: '3.5rem',
    xl4: '4rem',
    xl5: '4.5rem',
  },
  lineHeight: {
    s: 1,
    m: 1.2,
    l: 1.5,
    xl: 1.75,
  }, 
}

export default theme
