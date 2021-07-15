import * as React from 'react';

import Heading from '../heading/Heading';
import { StyledContent, StyledSection } from './styled';

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
    {header && <Heading loading={loading} header={header} tooltip={tooltip} />}
    <StyledContent>{children}</StyledContent>
  </StyledSection>
);

const defaultProps = {
  header: '',
  tooltip: '',
};

FormSection.defaultProps = defaultProps;

export default FormSection;
