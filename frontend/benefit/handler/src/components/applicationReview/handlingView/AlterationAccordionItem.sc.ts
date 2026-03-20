import { ALTERATION_STATE } from 'benefit-shared/constants';
import { Accordion, Button, Tag } from 'hds-react';
import styled, { DefaultTheme } from 'styled-components';

export const $AlterationAccordionItemContainer = styled.div`
  position: relative;

  div[role='heading'] > div[role='button'] > span.label {
    display: inline-block;
    max-width: 66.6%;
    padding-left: ${(props: { theme: DefaultTheme }) => props.theme.spacing.xl};
  }
`;

export const $AlterationAccordionItem = styled(Accordion)`
  margin-top: ${(props: { theme: DefaultTheme }) =>
    props.theme.spacingLayout.xs2};

  dl {
    row-gap: ${(props: { theme: DefaultTheme }) =>
      props.theme.spacingLayout.xs};
  }

  dl dt {
    font-weight: 500;
    padding-bottom: ${(props: { theme: DefaultTheme }) =>
      props.theme.spacing.s};
  }
  dl dd {
    margin: 0;
  }
`;

export const $TextAreaValue = styled.dd`
  white-space: pre-line;
`;

export const $AlterationAccordionItemIconContainer = styled.div`
  position: absolute;
  left: ${(props: { theme: DefaultTheme }) => props.theme.spacing.xs};
  top: ${(props: { theme: DefaultTheme }) => props.theme.spacing.s};
  pointer-events: none;
  z-index: 1;
  padding: 2px 0;
`;

export const $TagContainer = styled.div`
  position: absolute;
  left: 66.7%;
  top: ${(props: { theme: DefaultTheme }) => props.theme.spacing.xs};
  width: 33%;
  pointer-events: none;
  z-index: 1;
  padding: 2px 0;
`;

type TagExtraProps = {
  $state: ALTERATION_STATE;
  theme: DefaultTheme;
};

export const $Tag = styled(Tag)<TagExtraProps>`
  font-weight: normal;

  ${(props: TagExtraProps) => {
    let background = 'inherit';
    let color = 'inherit';

    switch (props.$state) {
      case ALTERATION_STATE.RECEIVED:
      case ALTERATION_STATE.OPENED:
        background = props.theme.colors.alert;
        break;

      case ALTERATION_STATE.HANDLED:
        background = props.theme.colors.success;
        color = 'white';
        break;

      case ALTERATION_STATE.CANCELLED:
        background = props.theme.colors.silverDark;
        break;

      default:
        break;
    }

    return `
      --tag-color: ${color};
      --tag-background: ${background};
    `;
  }}
`;

export const $ActionContainer = styled.div`
  display: flex;
  align-items: center;
  box-sizing: border-box;
  gap: ${(props: { theme: DefaultTheme }) => props.theme.spacing.m};
`;

export const $SecondaryDangerButton = styled(Button)`
  --border-color: ${(props: { theme: DefaultTheme }) =>
    props.theme.colors.error};
  --background-color: ${(props: { theme: DefaultTheme }) =>
    props.theme.colors.white};
  --background-color-hover: ${(props: { theme: DefaultTheme }) =>
    props.theme.colors.errorLight};
  --background-color-focus: ${(props: { theme: DefaultTheme }) =>
    props.theme.colors.white};
  --background-color-hover-focus: ${(props: { theme: DefaultTheme }) =>
    props.theme.colors.errorLight};
  --border-color: ${(props: { theme: DefaultTheme }) =>
    props.theme.colors.error};
  --border-color-hover: ${(props: { theme: DefaultTheme }) =>
    props.theme.colors.errorDark};
  --border-color-focus: ${(props: { theme: DefaultTheme }) =>
    props.theme.colors.error};
  --border-color-hover-focus: ${(props: { theme: DefaultTheme }) =>
    props.theme.colors.errorDark};
  --color: ${(props: { theme: DefaultTheme }) => props.theme.colors.error};
  --color-hover: ${(props: { theme: DefaultTheme }) =>
    props.theme.colors.error};
  --color-focus: ${(props: { theme: DefaultTheme }) =>
    props.theme.colors.error};
  --color-hover-focus: ${(props: { theme: DefaultTheme }) =>
    props.theme.colors.error};
  --focus-outline-color: ${(props: { theme: DefaultTheme }) =>
    props.theme.colors.error};
`;
