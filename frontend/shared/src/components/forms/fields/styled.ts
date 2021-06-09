import { Checkbox, RadioButton } from 'hds-react';
import { Theme } from 'shared/styles/theme';
import styled, { ThemeProps } from 'styled-components';

type Props = ThemeProps<Theme>;

const StyledCheckbox = styled(Checkbox)`
  --background-selected: ${(props: Props) => props.theme.colors.coatOfArms};
  --background-hover: ${(props: Props) => props.theme.colors.coatOfArms};
  --border-color-selected: ${(props: Props) => props.theme.colors.coatOfArms};
  --border-color-selected-hover: ${(props: Props) =>
    props.theme.colors.coatOfArms};
  --border-color-selected-focus: ${(props: Props) =>
    props.theme.colors.coatOfArms};
  --focus-outline-color: ${(props: Props) => props.theme.colors.coatOfArms};
`;

const StyledRadioButton = styled(RadioButton)`
  --border-color-selected: ${(props: Props) => props.theme.colors.coatOfArms};
  --border-color-selected-hover: ${(props: Props) =>
    props.theme.colors.coatOfArms};
  --border-color-selected-focus: ${(props: Props) =>
    props.theme.colors.coatOfArms};
  --icon-color-selected: ${(props: Props) => props.theme.colors.coatOfArms};
  --icon-color-hover: ${(props: Props) => props.theme.colors.coatOfArms};
`;

export { StyledCheckbox, StyledRadioButton };
