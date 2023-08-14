import theme from 'shared/styles/theme';
import styled from 'styled-components';

import { $FormSection } from './TableExtras.sc';

type Props = {
  bgColor?: string;
};

export const $InspectionTypeContainer = styled.div<Props>`
  border: 2px solid ${theme.colors.black50};
  padding: ${theme.spacing.s} ${theme.spacing.l} ${theme.spacing.s}
    ${theme.spacing.l};
  background-color: ${theme.colors.white};
  margin-bottom: ${theme.spacing.xs};

  ${$FormSection}:first-child {
    margin: ${theme.spacing.xs} 0 ${theme.spacing.xs} 0;
  }

  hr {
    border-top: 1px solid ${theme.colors.fog};
  }
`;
