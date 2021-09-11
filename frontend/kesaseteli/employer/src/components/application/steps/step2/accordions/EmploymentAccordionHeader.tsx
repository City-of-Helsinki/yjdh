import { IconAlertCircleFill } from 'hds-react';
import useGetEmployeeDisplayName from 'kesaseteli/employer/hooks/application/useGetEmployeeDisplayName';
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
  const headingText = useGetEmployeeDisplayName(index);

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

EmploymentAccordionHeader.defaultProps = {
  displayError: false,
};

export default EmploymentAccordionHeader;
