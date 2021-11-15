import * as React from 'react';
import Heading from 'shared/components/forms/heading/Heading';
import { HeadingProps } from 'shared/components/forms/heading/Heading.sc';
import {
  $Grid,
  $Hr,
  $Section,
  GridProps,
} from 'shared/components/forms/section/FormSection.sc';
import { useTheme } from 'styled-components';

import {
  $ActionBottom,
  $ActionLeft,
  $CheckIcon,
  $Wrapper,
  $WrapperInner,
} from './ReviewSection.sc';

export type ReviewSectionProps = {
  children?: React.ReactNode;
  action?: React.ReactNode;
  withoutDivider?: boolean;
  header?: string;
} & HeadingProps &
  GridProps;

const ReviewSection: React.FC<ReviewSectionProps> = ({
  children,
  header,
  action,
  role,
  loading,
  ...rest
}) => {
  const theme = useTheme();

  return (
    <$Wrapper withAction={Boolean(action)}>
      <$WrapperInner withAction={Boolean(action)}>
        {action && (
          <$ActionLeft>
            <$CheckIcon size="m" />
          </$ActionLeft>
        )}
        <$Section paddingBottom={Boolean(action)}>
          {header && (
            <Heading
              header={header}
              loading={loading}
              as="h2"
              size="s"
              {...rest}
            />
          )}
          {children && (
            <$Grid
              css={`
                font-size: ${theme.fontSize.body.l};
              `}
              role={role}
            >
              {children}
            </$Grid>
          )}
          {!action && (
            <$Hr
              css={`
                margin-top: ${theme.spacing.l};
              `}
            />
          )}
        </$Section>
      </$WrapperInner>
      {action && <$ActionBottom>{action}</$ActionBottom>}
    </$Wrapper>
  );
};

export default ReviewSection;
