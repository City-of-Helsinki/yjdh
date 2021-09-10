import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      brick: 'var(--color-brick)';
      brickLight: 'var(--color-brick-light)';
      brickMediumLight: 'var(--color-brick-medium-light)';
      brickDark: 'var(--color-brick-dark)';
      bus: 'var(--color-bus)';
      busLight: 'var(--color-bus-light)';
      busMediumLight: 'var(--color-bus-medium-light)';
      busDark: 'var(--color-bus-dark)';
      coatOfArms: 'var(--color-coat-of-arms)';
      coatOfArmsLight: 'var(--color-coat-of-arms-light)';
      coatOfArmsMediumLight: 'var(--color-coat-of-arms-medium-light)';
      coatOfArmsDark: 'var(--color-coat-of-arms-dark)';
      copper: 'var(--color-copper)';
      copperLight: 'var(--color-copper-light)';
      copperMediumLight: 'var(--color-copper-medium-light)';
      copperDark: 'var(--color-copper-dark)';
      engel: 'var(--color-engel)';
      engelLight: 'var(--color-engel-light)';
      engelMediumLight: 'var(--color-engel-medium-light)';
      engelDark: 'var(--color-engel-dark)';
      fog: 'var(--color-fog)';
      fogLight: 'var(--color-fog-light)';
      fogMediumLight: 'var(--color-fog-medium-light)';
      fogDark: 'var(--color-fog-dark)';
      gold: 'var(--color-gold)';
      goldLight: 'var(--color-gold-light)';
      goldMediumLight: 'var(--color-gold-medium-light)';
      goldDark: 'var(--color-gold-dark)';
      metro: 'var(--color-metro)';
      metroLight: 'var(--color-metro-light)';
      metroMediumLight: 'var(--color-metro-medium-light)';
      metroDark: 'var(--color-metro-dark)';
      silver: 'var(--color-silver)';
      silverLight: 'var(--color-silver-light)';
      silverMediumLight: 'var(--color-silver-medium-light)';
      silverDark: 'var(--color-silver-dark)';
      summer: 'var(--color-summer)';
      summerLight: 'var(--color-summer-light)';
      summerMediumLight: 'var(--color-summer-medium-light)';
      summerDark: 'var(--color-summer-dark)';
      suomenlinna: 'var(--color-suomenlinna)';
      suomenlinnaLight: 'var(--color-suomenlinna-light)';
      suomenlinnaMediumLight: 'var(--color-suomenlinna-medium-light)';
      suomenlinnaDark: 'var(--color-suomenlinna-dark)';
      tram: 'var(--color-tram)';
      tramLight: 'var(--color-tram-light)';
      tramMediumLight: 'var(--color-tram-medium-light)';
      tramDark: 'var(--color-tram-dark)';
      black: 'var(--color-black)';
      white: 'var(--color-white)';
      black5: 'var(--color-black-5)';
      black10: 'var(--color-black-10)';
      black20: 'var(--color-black-20)';
      black30: 'var(--color-black-30)';
      black40: 'var(--color-black-40)';
      black50: 'var(--color-black-50)';
      black60: 'var(--color-black-60)';
      black70: 'var(--color-black-70)';
      black80: 'var(--color-black-80)';
      black90: 'var(--color-black-90)';
      error: 'var(--color-error)';
      errorLight: 'var(--color-error-light)';
      errorDark: 'var(--color-error-dark)';
      success: 'var(--color-success)';
      successLight: 'var(--color-success-light)';
      successDark: 'var(--color-success-dark)';
      alert: 'var(--color-alert)';
      alertLight: 'var(--color-alert-light)';
      alertDark: 'var(--color-alert-dark)';
      info: 'var(--color-info)';
      infoLight: 'var(--color-info-light)';
      infoDark: 'var(--color-info-dark)';
    };
    fonts: {
      helGrotesk: 'var(--font-default)';
    };
    fontSize: {
      heading: {
        xl: 'var(--fontsize-heading-xl)';
        l: 'var(--fontsize-heading-l)';
        m: 'var(--fontsize-heading-m)';
        s: 'var(--fontsize-heading-s)';
        xs: 'var(--fontsize-heading-xs)';
        xxs: 'var(--fontsize-heading-xxs)';
      };
      body: {
        s: 'var(--fontsize-body-s)';
        m: 'var(--fontsize-body-m)';
        l: 'var(--fontsize-body-l)';
        xl: 'var(--fontsize-body-xl)';
      };
    };
    containerWidth: {
      xs: 'var(--container-width-xs)';
      s: 'var(--container-width-s)';
      m: 'var(--container-width-m)';
      l: 'var(--container-width-l)';
      xl: 'var(--container-width-xl)';
    };
    spacing: {
      xs4: 'var(--spacing-4-xs)';
      xs3: 'var(--spacing-3-xs)';
      xs2: 'var(--spacing-2-xs)';
      xs: 'var(--spacing-xs)';
      s: 'var(--spacing-s)';
      m: 'var(--spacing-m)';
      l: 'var(--spacing-l)';
      xl: 'var(--spacing-xl)';
      xl2: 'var(--spacing-2-xl)';
      xl3: 'var(--spacing-3-xl)';
      xl4: 'var(--spacing-4-xl)';
      xl5: 'var(--spacing-5-xl)';
    };
    spacingLayout: {
      xs2: 'var(--spacing-layout-2-xs)';
      xs: 'var(--spacing-layout-xs)';
      s: 'var(--spacing-layout-s)';
      m: 'var(--spacing-layout-m)';
      l: 'var(--spacing-layout-l)';
      xl: 'var(--spacing-layout-xl)';
      xl2: 'var(--spacing-layout-2-xl)';
    };
    lineHeight: {
      s: 'var(--lineheight-s)';
      m: 'var(--lineheight-m)';
      l: 'var(--lineheight-l)';
      xl: 'var(--lineheight-xl)';
    };
    breakpoints: {
      xs: '320px';
      s: '576px';
      m: '768px';
      l: '992px';
      xl: '1248px';
    };
  }
}
