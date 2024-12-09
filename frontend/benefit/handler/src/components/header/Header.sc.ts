import BaseHeader from 'shared/components/header/HeaderV3';
import { respondAbovePx } from 'shared/styles/mediaQueries';
import styled from 'styled-components';

export const $BaseHeader = styled(BaseHeader)`
  z-index: 100;
  background: #1a1a1a;
`;

export const $HeaderCustomItems = styled.ul`
  display: flex;
  align-items: center;
  margin-right: var(--spacing-s);
  list-style-type: none;
  margin: 0;
  > li {
    margin-right: var(--spacing-xs);
  }
`;

export const $ToggleButton = styled.button`
  all: initial;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 40px;
  height: 40px;
  color: white;
  outline: 0;
  appearance: none;
  padding: 0;
  svg {
    margin-left: -11px;
  }

  span {
    left: 24px;
    font-size: 14px;
    position: absolute;
    pointer-events: none;
    user-select: none;
  }
`;

type $HeaderNotifierProps = {
  $enabled: boolean;
};
export const $HeaderNotifier = styled.div<$HeaderNotifierProps>`
  position: relative;
  opacity: ${(props) => (props.$enabled ? 1 : 0.25)};
  pointer-events: ${(props) => (props.$enabled ? 'auto' : 'none')};
  ${$ToggleButton} {
    cursor: pointer;
    background: ${(props) =>
      props.$enabled ? props.theme.colors.coatOfArmsDark : 'transparent'};

    &:hover,
    &:active {
      background: ${(props) =>
        props.$enabled ? props.theme.colors.coatOfArms : 'transparent'};
    }

    &:focus {
      outline: 2px solid #fff;
    }
  }
`;

type $BoxProps = {
  $open: boolean;
};

export const $Box = styled.div<$BoxProps>`
  position: absolute;
  top: 50px;
  z-index: 99999;
  visibility: ${(props) => (props.$open ? 'visible' : 'hidden')};
  background: white;
  color: black;
  border-radius: 5px;
  box-shadow: 0 0px 10px rgba(0, 0, 0, 0.4);
  border: 1px solid #222;
  width: 420px;
  left: -300px;

  ${respondAbovePx(992)`
      left: -200px;
  `}

  ${respondAbovePx(1460)`
      left: -100px;
  `}

  // Triangle
  &:before {
    position: absolute;
    content: '';
    width: 0px;
    height: 0px;
    top: -8px;
    z-index: 99999;
    border-style: solid;
    border-width: 0 6px 8px 6px;
    border-color: transparent transparent #fff transparent;
    transform: rotate(0deg);
    display: none;

    ${respondAbovePx(768)`
      display: block;
      left: 313px;
   `}
    ${respondAbovePx(992)`
      left: 213px;
    `}
    ${respondAbovePx(1460)`
      left: 113px;
    `}
  }

  h2 {
    margin: 1rem 1rem 0.75rem;
    font-size: 1.25rem;
    color: ${(props) => props.theme.colors.coatOfArms};
    user-select: none;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    font-size: 0.95rem;

    li {
      border-bottom: 1px solid ${(props) => props.theme.colors.black20};

      &:nth-child(even) {
        background: ${(props) => props.theme.colors.black5};
      }

      &:first-child {
        border-top: 1px solid ${(props) => props.theme.colors.black20};
      }

      &:last-child {
        border-bottom: 0;
        border-bottom-left-radius: 5px;
        border-bottom-right-radius: 5px;
      }
    }
  }
  &:hover {
    > ul > li:hover {
      background: ${(props) => props.theme.colors.black10};
    }
  }
`;

export const $ApplicationWithMessages = styled.button`
  text-decoration: none;
  color: #222;
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem 0.75rem 1rem;
  cursor: pointer;
  appearance: none;
  line-height: normal;
  border: 0;
  text-align: left;
  width: 100%;
  background: transparent;

  div {
    margin-right: 1rem;
    hyphens: auto;
    max-width: 130px;
    &:hover {
      background: ${(props) => props.theme.colors.black10};
    }

    &:first-child {
      width: 90px;
      min-width: 90px;
      margin-right: 0;
    }
    &:nth-child(2) {
      width: 140px;
      min-width: 140px;
    }
    &:last-child {
      margin: 0 0 0 auto;
      width: 20px;
      height: 24px;
      max-width: 20px;
    }
  }

  strong {
    font-weight: 500;
  }

  box-sizing: border-box;
`;
