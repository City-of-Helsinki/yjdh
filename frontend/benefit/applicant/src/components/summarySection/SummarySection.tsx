import * as React from 'react';
import Heading from 'shared/components/forms/heading/Heading';
import { HeadingProps } from 'shared/components/forms/heading/Heading.sc';
import {
  $Action,
  $Grid,
  $Hr,
  $Section,
  GridProps,
} from 'shared/components/forms/section/FormSection.sc';
import { breakpoints, respondAbove } from 'shared/styles/mediaQueries';
import styled, { useTheme } from 'styled-components';

import { $Wrapper } from './SummarySection.sc';

const $MyWrapper = styled($Wrapper)`
  ${$Action} {
    position: relative;
    ${respondAbove('sm')`
      position: absolute;
    `}
  }
`;

export type SummarySectionProps = {
  children?: React.ReactNode;
  withoutDivider?: boolean;
  paddingBottom?: boolean;
  header?: string;
  action?: React.ReactNode;
} & HeadingProps &
  GridProps;

const SummarySection: React.FC<SummarySectionProps> = ({
  children,
  header,
  action,
  withoutDivider = false,
  paddingBottom = false,
  role,
  loading,
  ...rest
}) => {
  const theme = useTheme();
  return (
    <$MyWrapper>
      <$Section paddingBottom={paddingBottom}>
        {header && (
          <Heading
            header={header}
            as="h2"
            size="s"
            loading={loading}
            {...rest}
          />
        )}
        {children && (
          <$Grid
            role={role}
            css={`
              font-size: ${theme.fontSize.body.l};
              line-height: ${theme.lineHeight.l};
              margin-bottom: ${withoutDivider ? theme.spacing.m : 0};
            `}
            {...rest}
          >
            {children}
          </$Grid>
        )}
        {action && <$Action>{action}</$Action>}
        {!withoutDivider && (
          <$Hr
            css={`
              margin-top: ${theme.spacing.m};
            `}
          />
        )}
      </$Section>
    </$MyWrapper>
  );
};

export default SummarySection;
