import { Checkbox, RadioButton, Select } from 'hds-react';
import styled from 'styled-components';

export const $Checkbox = styled(Checkbox)`
  --background-selected: ${(props) => props.theme.colors.coatOfArms};
  --background-hover: ${(props) => props.theme.colors.coatOfArms};
  --border-color-selected: ${(props) => props.theme.colors.coatOfArms};
  --border-color-selected-hover: ${(props) => props.theme.colors.coatOfArms};
  --border-color-selected-focus: ${(props) => props.theme.colors.coatOfArms};
  --focus-outline-color: ${(props) => props.theme.colors.coatOfArms};
`;

export const $RadioButton = styled(RadioButton)`
  --border-color-selected: ${(props) => props.theme.colors.coatOfArms};
  --border-color-selected-hover: ${(props) => props.theme.colors.coatOfArms};
  --border-color-selected-focus: ${(props) => props.theme.colors.coatOfArms};
  --icon-color-selected: ${(props) => props.theme.colors.coatOfArms};
  --icon-color-hover: ${(props) => props.theme.colors.coatOfArms};
`;

export const $Dropdown = styled(Select)`
  --border-color-selected: ${(props) => props.theme.colors.coatOfArms};
  --border-color-selected-hover: ${(props) => props.theme.colors.coatOfArms};
  --border-color-selected-focus: ${(props) => props.theme.colors.coatOfArms};
`;
