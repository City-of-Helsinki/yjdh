import { IconAlertCircleFill } from 'hds-react';
import useWatchEmployeeDisplayName from 'kesaseteli/employer/hooks/employments/useWatchEmployeeDisplayName';
import React from 'react';

import {
  $AccordionHeader,
  $AccordionHeaderText,
  $ErrorIconContainer,
} from './EmploymentAccordion.sc';

type Props = {
  index: number;
  displayError?: boolean;
};

const EmploymentAccordionHeader: React.FC<Props> = ({
  index,
  displayError = false,
}: Props) => {
  const headingText = useWatchEmployeeDisplayName(index);

  return (
    <$AccordionHeader displayError={displayError}>
      <$AccordionHeaderText>{headingText}</$AccordionHeaderText>
      {displayError && (
        <$ErrorIconContainer>
          <IconAlertCircleFill size="s" />
        </$ErrorIconContainer>
      )}
    </$AccordionHeader>
  );
};

export default EmploymentAccordionHeader;
