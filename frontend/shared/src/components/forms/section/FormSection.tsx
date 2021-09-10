import * as React from 'react';

import Heading from '../heading/Heading';
import { $Action, $Grid, $Section } from './FormSection.sc';

type FormSectionProps = {
  children: React.ReactNode;
  header?: string;
  loading?: boolean;
  tooltip?: string;
  action?: React.ReactNode;
};

const FormSection: React.FC<FormSectionProps> = ({
  children,
  header = '',
  loading,
  tooltip,
  action,
}) => (
  <$Section>
    {action && <$Action>{action}</$Action>}
    {header && (
      <Heading loading={loading} header={header} tooltip={tooltip} as="h2" />
    )}
    <$Grid>{children}</$Grid>
  </$Section>
);

export default FormSection;
