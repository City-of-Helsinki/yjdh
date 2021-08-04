import { Checkbox, RadioButton, Select } from 'hds-react';
import $ from 'styled-components';

export const $Checkbox = $(Checkbox)`
  --background-selected: ${(props) => props.theme.colors.coatOfArms};
  --background-hover: ${(props) => props.theme.colors.coatOfArms};
  --border-color-selected: ${(props) => props.theme.colors.coatOfArms};
  --border-color-selected-hover: ${(props) => props.theme.colors.coatOfArms};
  --border-color-selected-focus: ${(props) => props.theme.colors.coatOfArms};
  --focus-outline-color: ${(props) => props.theme.colors.coatOfArms};
`;

export const $RadioButton = $(RadioButton)`
  --border-color-selected: ${(props) => props.theme.colors.coatOfArms};
  --border-color-selected-hover: ${(props) => props.theme.colors.coatOfArms};
  --border-color-selected-focus: ${(props) => props.theme.colors.coatOfArms};
  --icon-color-selected: ${(props) => props.theme.colors.coatOfArms};
  --icon-color-hover: ${(props) => props.theme.colors.coatOfArms};
`;

export const $Dropdown = $(Select)`
  --border-color-selected: ${(props) => props.theme.colors.coatOfArms};
  --border-color-selected-hover: ${(props) => props.theme.colors.coatOfArms};
  --border-color-selected-focus: ${(props) => props.theme.colors.coatOfArms};
`;
