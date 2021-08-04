import * as React from 'react';

import Heading from '../heading/Heading';
import { $Content, $Section } from './FormSection.sc';

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
  <$Section>
    {header && <Heading loading={loading} header={header} tooltip={tooltip} />}
    <$Content>{children}</$Content>
  </$Section>
);

const defaultProps = {
  header: '',
  tooltip: '',
};

FormSection.defaultProps = defaultProps;

export default FormSection;
