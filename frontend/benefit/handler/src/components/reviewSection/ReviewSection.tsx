import { ROUTES } from 'benefit/handler/constants';
import ReviewStateContext from 'benefit/handler/context/ReviewStateContext';
import { ReviewState } from 'benefit/handler/types/application';
import { Button, IconPen } from 'hds-react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
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

import {
  $ActionLeft,
  $CheckIcon,
  $CheckIconFill,
  $EditButtonContainer,
} from './ReviewSection.sc';
import { useReviewSection } from './useReviewSection';

export type ReviewSectionProps = {
  children?: React.ReactNode;
  action?: React.ReactNode;
  withMargin?: boolean;
  withBorder?: boolean;
  withoutDivider?: boolean;
  header?: string;
  id?: string;
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
  id,
  ...rest
}) => {
  const { theme, bgColor, withAction } = useReviewSection(action, withMargin);
  const { reviewState, handleUpdateReviewState } =
    React.useContext(ReviewStateContext);
  const sectionState = reviewState[section];

  const router = useRouter();
  const { t } = useTranslation();

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
        margin-bottom: ${theme.spacing.m};
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
      {id && withAction && (
        <$EditButtonContainer>
          <Button
            theme="black"
            variant="supplementary"
            iconLeft={<IconPen />}
            onClick={() =>
              router.push(`${String(ROUTES.APPLICATION_FORM_EDIT)}?id=${id}`)
            }
          >
            {t(`common:review.actions.edit`)}
          </Button>
        </$EditButtonContainer>
      )}

      <$GridCell $colSpan={12} $colStart={2}>
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
