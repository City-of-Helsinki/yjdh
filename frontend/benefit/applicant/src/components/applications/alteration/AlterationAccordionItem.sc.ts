import { Accordion } from 'hds-react';
import styled from 'styled-components';

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
