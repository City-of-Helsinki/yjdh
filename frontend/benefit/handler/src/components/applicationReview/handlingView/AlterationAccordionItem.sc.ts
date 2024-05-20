import { ALTERATION_STATE } from 'benefit-shared/constants';
import { Accordion, Button, Tag } from 'hds-react';
import styled from 'styled-components';

export const $AlterationAccordionItemContainer = styled.div`
  position: relative;

  div[role='heading'] > div[role='button'] > span.label {
    display: inline-block;
    max-width: 66.6%;
    padding-left: ${(props) => props.theme.spacing.xl};
  }
`;

export const $AlterationAccordionItem = styled(Accordion)`
  margin-top: ${(props) => props.theme.spacingLayout.xs2};

  dl {
    row-gap: ${(props) => props.theme.spacingLayout.xs};
  }

  dl dt {
    font-weight: 500;
    padding-bottom: ${(props) => props.theme.spacing.s};
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
  left: ${(props) => props.theme.spacing.xs};
  top: ${(props) => props.theme.spacing.s};
  pointer-events: none;
  z-index: 1;
  padding: 2px 0;
`;

export const $TagContainer = styled.div`
  position: absolute;
  left: 66.7%;
  top: ${(props) => props.theme.spacing.xs};
  width: 33%;
  pointer-events: none;
  z-index: 1;
  padding: 2px 0;
`;

type TagExtraProps = {
  $state: ALTERATION_STATE;
};

export const $Tag = styled(Tag)<TagExtraProps>`
  font-weight: normal;

  ${(props) => {
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
  gap: ${(props) => props.theme.spacing.m};
`;

export const $SecondaryDangerButton = styled(Button)`
  --border-color: ${(props) => props.theme.colors.error};
  --background-color: ${(props) => props.theme.colors.white};
  --background-color-hover: ${(props) => props.theme.colors.errorLight};
  --background-color-focus: ${(props) => props.theme.colors.white};
  --background-color-hover-focus: ${(props) => props.theme.colors.errorLight};
  --border-color: ${(props) => props.theme.colors.error};
  --border-color-hover: ${(props) => props.theme.colors.errorDark};
  --border-color-focus: ${(props) => props.theme.colors.error};
  --border-color-hover-focus: ${(props) => props.theme.colors.errorDark};
  --color: ${(props) => props.theme.colors.error};
  --color-hover: ${(props) => props.theme.colors.error};
  --color-focus: ${(props) => props.theme.colors.error};
  --color-hover-focus: ${(props) => props.theme.colors.error};
  --focus-outline-color: ${(props) => props.theme.colors.error};
`;
