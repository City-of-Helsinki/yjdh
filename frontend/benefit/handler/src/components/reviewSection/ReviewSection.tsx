import * as React from 'react';
import Heading from 'shared/components/forms/heading/Heading';
import { HeadingProps } from 'shared/components/forms/heading/Heading.sc';
import {
  $Grid,
  $GridCell,
  $Hr,
  $Section,
  GridProps,
} from 'shared/components/forms/section/FormSection.sc';

import { $ActionLeft, $CheckIcon } from './ReviewSection.sc';
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
  withoutDivider,
  role,
  loading,
  ...rest
}) => {
  const { theme, bgColor, withAction } = useReviewSection(action, withMargin);

  return (
    <$Grid
      css={`
        background-color: ${bgColor};
        margin-bottom: ${theme.spacing.s};
        gap: 0;
      `}
    >
      {withAction && (
        <$GridCell $colSpan={1}>
          <$ActionLeft>
            {action && <$CheckIcon aria-label="application-action" size="m" />}
          </$ActionLeft>
        </$GridCell>
      )}
      <$GridCell $colStart={2} $colSpan={12}>
        <$Section paddingBottom={withAction && !withMargin}>
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
                line-height: ${theme.lineHeight.l};
              `}
              role={role}
            >
              {children}
            </$Grid>
          )}
          {!withAction && !withoutDivider && (
            <$Hr
              css={`
                margin-top: ${theme.spacing.l};
              `}
            />
          )}
        </$Section>
      </$GridCell>
      {action && (
        <>
          <$GridCell
            css={`
              background-color: ${theme.colors.silver};
            `}
          />
          <$GridCell
            css={`
              background-color: ${theme.colors.silver};
            `}
            $colSpan={12}
            $colStart={2}
          >
            {action}
          </$GridCell>
        </>
      )}
    </$Grid>
  );
};

ReviewSection.defaultProps = {
  children: undefined,
  action: undefined,
  withMargin: undefined,
  withoutDivider: undefined,
  header: undefined,
};

export default ReviewSection;
