import theme from './theme'

export const Main = `
  html {
    height: 100%;
    width: 100%;
  }

  body {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
  }
s
  #root {
    flex: 1;
    background-color: var(--color-black-5);
  }

  a {
    &:focus {
      outline: 2px solid var(--color-black);
    }
  }

  button {
    border: none;
    background-color: transparent;
    cursor: pointer;
  }

  @include respond-below(sm) {
    body.scrollDisabledOnMobile {
      overflow: hidden;
    }
  }

  // Override globally all text to use Helsinki font.
  * {
    font-family: ${theme.fonts.helGrotesk}
  }
`