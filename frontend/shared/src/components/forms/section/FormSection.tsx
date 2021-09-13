import * as React from 'react';

import Heading from '../heading/Heading';
import { $Action, $Grid, $Hr,$Section } from './FormSection.sc';

type FormSectionProps = {
  children: React.ReactNode;
  header?: string;
  loading?: boolean;
  tooltip?: string;
  action?: React.ReactNode;
  withoutDivider?: boolean;
};

const FormSection: React.FC<FormSectionProps> = ({
  children,
  header = '',
  loading,
  tooltip,
  action,
  withoutDivider = false,
}) => (
  <$Section>
    {action && <$Action>{action}</$Action>}
    {header && (
      <Heading loading={loading} header={header} tooltip={tooltip} as="h2" />
    )}
    <$Grid>{children}</$Grid>
    {!withoutDivider && <$Hr />}
  </$Section>
);

export default FormSection;
