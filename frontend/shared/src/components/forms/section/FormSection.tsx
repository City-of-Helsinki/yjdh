import * as React from 'react';

import { StyledContent, StyledHeader, StyledSection } from './styled';

type FormSectionProps = { children: React.ReactNode; header?: string };

const FormSection: React.FC<FormSectionProps> = ({ children, header }) => (
  <StyledSection>
    <StyledHeader>{header}</StyledHeader>
    <StyledContent>{children}</StyledContent>
  </StyledSection>
);

const defaultProps = {
  header: '',
};

FormSection.defaultProps = defaultProps;

export default FormSection;
