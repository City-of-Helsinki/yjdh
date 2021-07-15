import { Checkbox, RadioButton, Select } from 'hds-react';
import styled from 'styled-components';

const StyledCheckbox = styled(Checkbox)`
  --background-selected: ${(props) => props.theme.colors.coatOfArms};
  --background-hover: ${(props) => props.theme.colors.coatOfArms};
  --border-color-selected: ${(props) => props.theme.colors.coatOfArms};
  --border-color-selected-hover: ${(props) => props.theme.colors.coatOfArms};
  --border-color-selected-focus: ${(props) => props.theme.colors.coatOfArms};
  --focus-outline-color: ${(props) => props.theme.colors.coatOfArms};
`;

const StyledRadioButton = styled(RadioButton)`
  --border-color-selected: ${(props) => props.theme.colors.coatOfArms};
  --border-color-selected-hover: ${(props) => props.theme.colors.coatOfArms};
  --border-color-selected-focus: ${(props) => props.theme.colors.coatOfArms};
  --icon-color-selected: ${(props) => props.theme.colors.coatOfArms};
  --icon-color-hover: ${(props) => props.theme.colors.coatOfArms};
`;

const StyledDropdown = styled(Select)`
  --border-color-selected: ${(props) => props.theme.colors.coatOfArms};
  --border-color-selected-hover: ${(props) => props.theme.colors.coatOfArms};
  --border-color-selected-focus: ${(props) => props.theme.colors.coatOfArms};
`;

export { StyledCheckbox, StyledDropdown,StyledRadioButton };
