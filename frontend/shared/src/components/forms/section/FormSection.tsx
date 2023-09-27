import * as React from 'react';

import Heading from '../heading/Heading';
import {
  $Action,
  $Grid,
  $GridCell,
  $Hr,
  $Section,
  FormSectionProps,
} from './FormSection.sc';

const FormSection: React.FC<FormSectionProps> = ({
  children,
  header,
  headerLevel = 'h1',
  action,
  gridActions,
  withoutDivider = false,
  paddingBottom = false,
  role,
  loading,
  'aria-label': ariaLabel,
  'data-testid': dataTestId,
  columns,
  ...rest
}) => (
  <$Section
    paddingBottom={paddingBottom}
    aria-label={ariaLabel ?? header}
    data-testid={dataTestId}
  >
    {action && <$Action>{action}</$Action>}
    {header && (
      <Heading as={headerLevel} header={header} loading={loading} {...rest} />
    )}
    {children && (
      <$Grid role={role} columns={columns} {...rest}>
        <>
          {gridActions && (
            <$GridCell $colSpan={columns}>{gridActions}</$GridCell>
          )}
          {children}
        </>
      </$Grid>
    )}
    {!withoutDivider && <$Hr />}
  </$Section>
);

export default FormSection;
