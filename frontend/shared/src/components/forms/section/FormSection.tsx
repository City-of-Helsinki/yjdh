import * as React from 'react';

import Heading from '../heading/Heading';
import {
  $Action,
  $Grid,
  $Hr,
  $Section,
  FormSectionProps,
} from './FormSection.sc';

const FormSection: React.FC<FormSectionProps> = ({
  children,
  header,
  action,
  withoutDivider = false,
  'padding-bottom': paddingBottom = true,
  ...rest
}) => (
  <$Section padding-bottom={paddingBottom}>
    {action && <$Action>{action}</$Action>}
    {header && <Heading header={header} {...rest} />}
    {children && <$Grid {...rest}>{children}</$Grid>}
    {!withoutDivider && <$Hr />}
  </$Section>
);

export default FormSection;
