import { LoadingSpinner, Tooltip } from 'hds-react';
import * as React from 'react';

import { StyledContent, StyledHeader, StyledSection } from './styled';

type FormSectionProps = {
  children: React.ReactNode;
  header?: string;
  loading?: boolean;
  tooltip?: string;
};

const FormSection: React.FC<FormSectionProps> = ({
  children,
  header,
  loading,
  tooltip,
}) => (
  <StyledSection>
    {header && (
      <StyledHeader>
        {header}
        {tooltip && <Tooltip>{tooltip}</Tooltip>}
        {loading && <LoadingSpinner small />}
      </StyledHeader>
    )}
    <StyledContent>{children}</StyledContent>
  </StyledSection>
);

const defaultProps = {
  header: '',
  tooltip: '',
};

FormSection.defaultProps = defaultProps;

export default FormSection;
