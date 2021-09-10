import * as React from 'react';

import Heading from '../heading/Heading';
import { $Grid, $Section } from './FormSection.sc';

type FormSectionProps = {
  children: React.ReactNode;
  header?: string;
  loading?: boolean;
  tooltip?: string;
};

const FormSection: React.FC<FormSectionProps> = ({
  children,
  header = '',
  loading,
  tooltip = '',
}) => (
  <$Section>
    {header && (
      <Heading loading={loading} header={header} tooltip={tooltip} as="h2" />
    )}
    <$Grid>{children}</$Grid>
  </$Section>
);

export default FormSection;
