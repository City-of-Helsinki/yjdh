import { Accordion, AccordionProps } from 'hds-react';
import styled from 'styled-components';

const $AccordionSection = styled(Accordion) <AccordionProps>`
  --border-color: var(--color-black);
  margin-top: var(--spacing-l);
`;

export default $AccordionSection
