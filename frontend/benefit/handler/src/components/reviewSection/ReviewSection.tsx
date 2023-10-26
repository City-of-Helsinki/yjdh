import ReviewStateContext from 'benefit/handler/context/ReviewStateContext';
import { ReviewState } from 'benefit/handler/types/application';
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

import { $ActionLeft, $CheckIcon, $CheckIconFill } from './ReviewSection.sc';
import { useReviewSection } from './useReviewSection';

export type ReviewSectionProps = {
  children?: React.ReactNode;
  action?: React.ReactNode;
  withMargin?: boolean;
  withBorder?: boolean;
  withoutDivider?: boolean;
  header?: string;
  section?: keyof ReviewState;
} & HeadingProps &
  GridProps;

const ReviewSection: React.FC<ReviewSectionProps> = ({
  children,
  header,
  action,
  withMargin,
  withBorder,
  withoutDivider,
  role,
  loading,
  section,
  ...rest
}) => {
  const { theme, bgColor, withAction } = useReviewSection(action, withMargin);
  const { reviewState, handleUpdateReviewState } =
    React.useContext(ReviewStateContext);
  const sectionState = reviewState[section];

  const handleReviewClick = (): void => {
    handleUpdateReviewState({ ...reviewState, [section]: !sectionState });
  };

  const CheckIcon: React.FC = () => {
    if (sectionState) {
      return (
        <$CheckIconFill
          aria-label="application-action"
          size="m"
          onClick={handleReviewClick}
        />
      );
    }
    return (
      <$CheckIcon
        aria-label="application-action"
        size="m"
        onClick={handleReviewClick}
      />
    );
  };

  return (
    <$Grid
      css={`
        background-color: ${bgColor};
        margin-bottom: ${theme.spacing.s};
        gap: 0;
        border: ${withBorder
          ? `2px solid ${theme.colors.coatOfArmsMediumLight}`
          : 'none'};
      `}
    >
      {withAction && (
        <$GridCell $colSpan={1}>
          <$ActionLeft>{action && <CheckIcon />}</$ActionLeft>
        </$GridCell>
      )}
      <$GridCell $colStart={2} $colSpan={12}>
        <$Section paddingBottom={withAction && !withMargin}>
          {header && (
            <Heading
              header={header}
              loading={loading}
              as="h2"
              size="m"
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

export default ReviewSection;
