import * as React from 'react';
import Heading from 'shared/components/forms/heading/Heading';
import { HeadingProps } from 'shared/components/forms/heading/Heading.sc';
import {
  $Grid,
  $Hr,
  $Section,
  GridProps,
} from 'shared/components/forms/section/FormSection.sc';

import {
  $ActionBottom,
  $ActionLeft,
  $CheckIcon,
  $Wrapper,
  $WrapperInner,
} from './ReviewSection.sc';
import { useReviewSection } from './useReviewSection';

export type ReviewSectionProps = {
  children?: React.ReactNode;
  action?: React.ReactNode;
  withMargin?: boolean;
  withoutDivider?: boolean;
  header?: string;
} & HeadingProps &
  GridProps;

const ReviewSection: React.FC<ReviewSectionProps> = ({
  children,
  header,
  action,
  withMargin,
  role,
  loading,
  ...rest
}) => {
  const { theme, bgColor, withAction } = useReviewSection(action, withMargin);

  return (
    <$Wrapper withAction={withAction} bgColor={bgColor}>
      <$WrapperInner withAction={withAction}>
        {withAction && (
          <$ActionLeft>{action && <$CheckIcon size="m" />}</$ActionLeft>
        )}
        <$Section paddingBottom={withAction}>
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
                padding: ${withMargin ? theme.spacing.m : 0} 0;
              `}
              role={role}
            >
              {children}
            </$Grid>
          )}
          {!withAction && (
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
