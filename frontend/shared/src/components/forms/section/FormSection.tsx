import { LoadingSpinner } from 'hds-react';
import * as React from 'react';

import { StyledContent, StyledHeader, StyledSection } from './styled';

type FormSectionProps = {
  children: React.ReactNode;
  header?: string;
  loading?: boolean;
};

const FormSection: React.FC<FormSectionProps> = ({
  children,
  header,
  loading,
}) => (
  <StyledSection>
    {header && (
      <StyledHeader>
        {header}
        {loading && <LoadingSpinner small />}
      </StyledHeader>
    )}
    <StyledContent>{children}</StyledContent>
  </StyledSection>
);

const defaultProps = {
  header: '',
};

FormSection.defaultProps = defaultProps;

export default FormSection;
