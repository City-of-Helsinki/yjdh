import ReviewSection from 'benefit/handler/components/reviewSection/ReviewSection';
import { DateInput, IconArrowUndo } from 'hds-react';
import noop from 'lodash/noop';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import {
  $ViewField,
  $ViewFieldBold,
} from 'shared/components/benefit/summaryView/SummaryView.sc';
import {
  $Grid,
  $GridCell,
} from 'shared/components/forms/section/FormSection.sc';
import { useTheme } from 'styled-components';

import {
  $CalculatorHr,
  $CalculatorTableRow,
  $CalculatorText,
  $ResetDatesWrapper,
  $ResetLink,
} from '../ApplicationReview.sc';

const EmploymentAppliedMoreView: React.FC = () => {
  const translationsBase = 'common:calculators.employment';
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <ReviewSection withMargin>
      <$GridCell $colSpan={3}>
        <$CalculatorText>{t(`${translationsBase}.header`)}</$CalculatorText>
        <$ViewField>
          {t(`${translationsBase}.startEndDates`, {
            startDate: '10.09.2021',
            endDate: '10.11.2021',
            period: '2,03',
          })}
        </$ViewField>
      </$GridCell>
      <$GridCell $colSpan={11}>
        <$CalculatorHr />
        <$CalculatorText
          css={`
            margin: 0 0 ${theme.spacing.xs2} 0;
            font-weight: 500;
          `}
        >
          {t(`${translationsBase}.grantedPeriod`, { period: '2,03' })}
        </$CalculatorText>
        <$Grid>
          <$GridCell $colStart={1} $colSpan={2}>
            <DateInput
              id="date1"
              name="date1"
              placeholder="10.02.2021"
              onChange={noop}
              value=""
              required
            />
          </$GridCell>
          <$GridCell $colSpan={2}>
            <DateInput
              id="date2"
              name="date2"
              placeholder="15.02.2021"
              onChange={noop}
              value=""
              required
            />
          </$GridCell>
          <$GridCell $colStart={11} $colSpan={2}>
            <$ResetDatesWrapper>
              <IconArrowUndo />
              <$ResetLink aria-label={t(`${translationsBase}.reset`)} href="#">
                {t(`${translationsBase}.reset`)}
              </$ResetLink>
            </$ResetDatesWrapper>
          </$GridCell>
        </$Grid>
      </$GridCell>
      <$GridCell $colSpan={11}>
        <$CalculatorHr />
        <$Grid>
          <$GridCell $colSpan={6}>
            <$CalculatorTableRow>
              <$ViewField>{t(`${translationsBase}.tableRowHeader`)}</$ViewField>
              <$ViewField>
                {t(`${translationsBase}.tableRowValue`, { amount: 500 })}
              </$ViewField>
            </$CalculatorTableRow>
          </$GridCell>
        </$Grid>
        <$Grid>
          <$GridCell $colSpan={6}>
            <$CalculatorTableRow isTotal>
              <$ViewFieldBold>
                {t(`${translationsBase}.tableTotalHeader`)}
              </$ViewFieldBold>
              <$ViewFieldBold>
                {t(`${translationsBase}.tableRowValue`, { amount: 1015 })}
              </$ViewFieldBold>
            </$CalculatorTableRow>
          </$GridCell>
        </$Grid>
      </$GridCell>
    </ReviewSection>
  );
};

export default EmploymentAppliedMoreView;
