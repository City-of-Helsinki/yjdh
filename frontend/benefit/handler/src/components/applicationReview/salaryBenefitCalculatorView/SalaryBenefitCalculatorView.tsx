import ReviewSection from 'benefit/handler/components/reviewSection/ReviewSection';
import { Button, DateInput, IconArrowUndo, Select, TextInput } from 'hds-react';
import noop from 'lodash/noop';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import {
  $ViewField,
  $ViewFieldBold,
} from 'shared/components/benefit/summaryView/SummaryView.sc';
import { $Checkbox } from 'shared/components/forms/fields/Fields.sc';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { useTheme } from 'styled-components';

import {
  $CalculatorHr,
  $CalculatorTableRow,
  $CalculatorText,
  $ResetDatesWrapper,
  $ResetLink,
} from '../ApplicationReview.sc';

const SalaryBenefitCalculatorView: React.FC = () => {
  const translationsBase = 'common:calculators.salary';
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <ReviewSection withMargin>
      <$GridCell $colSpan={5}>
        <$CalculatorText
          css={`
            margin: 0 0 ${theme.spacing.xs2} 0;
            font-weight: 500;
          `}
        >
          {t(`${translationsBase}.header`)}
        </$CalculatorText>
      </$GridCell>

      <$GridCell $rowStart={2} $colSpan={4}>
        <$ViewField>
          {t(`${translationsBase}.startEndDates`, {
            startDate: '10.09.2021',
            endDate: '10.11.2021',
            period: '2,03',
          })}
        </$ViewField>
      </$GridCell>

      <$GridCell $rowStart={2} $colSpan={2}>
        <TextInput
          id=""
          name=""
          label={t(`${translationsBase}.monthlyPay`)}
          onBlur={() => {}}
          onChange={(e) => {}}
          value=""
          invalid={false}
          aria-invalid={false}
          errorText=""
        />
      </$GridCell>

      <$GridCell $rowStart={2} $colSpan={2}>
        <TextInput
          id=""
          name=""
          label={t(`${translationsBase}.otherExpenses`)}
          onBlur={() => {}}
          onChange={(e) => {}}
          value=""
          invalid={false}
          aria-invalid={false}
          errorText=""
        />
      </$GridCell>

      <$GridCell $rowStart={2} $colSpan={2}>
        <TextInput
          id=""
          name=""
          label={t(`${translationsBase}.vacationMoney`)}
          onBlur={() => {}}
          onChange={(e) => {}}
          value=""
          invalid={false}
          aria-invalid={false}
          errorText=""
        />
      </$GridCell>

      <$GridCell $colSpan={11}>
        <$CalculatorHr />
        <$Checkbox
          css={`
            input {
              background-color: ${theme.colors.white};
            }
          `}
          id=""
          name=""
          label={t(`${translationsBase}.manualInput`)}
          checked={false}
          onChange={noop}
        />
        <$CalculatorHr
          css={`
            margin-top: ${theme.spacing.m};
          `}
        />
      </$GridCell>

      <$GridCell $colSpan={2}>
        <$GridCell>
          <Select
            defaultValue=""
            helper=""
            optionLabelField="label"
            label={t(`${translationsBase}.maximumAid`)}
            onChange={() => {}}
            options={[]}
            id=""
            placeholder={t('common:select')}
            invalid={false}
            aria-invalid={false}
          />
        </$GridCell>
      </$GridCell>

      <$GridCell $colStart={1} $colSpan={2}>
        <$GridCell>
          <Select
            defaultValue=""
            helper=""
            optionLabelField="label"
            label={t(`${translationsBase}.salarySubsidyPercentage`)}
            onChange={() => {}}
            options={[]}
            id=""
            placeholder={t('common:select')}
            invalid={false}
            aria-invalid={false}
          />
        </$GridCell>
      </$GridCell>

      <$GridCell $colStart={4} $colSpan={5}>
        <$CalculatorText
          css={`
            margin: 0 0 ${theme.spacing.xs3} 0;
            font-weight: 500;
          `}
        >
          {t(`${translationsBase}.salarySupportPeriod`, { period: '2,03' })}
        </$CalculatorText>

        <div style={{ display: 'flex' }}>
          <DateInput
            id="date1"
            name="date1"
            placeholder="10.02.2021"
            onChange={noop}
            value=""
            required
            css={`
              margin-right: ${theme.spacing.xs3};
            `}
          />

          <DateInput
            id="date2"
            name="date2"
            placeholder="15.02.2021"
            onChange={noop}
            value=""
            required
          />
        </div>
      </$GridCell>

      <$GridCell $colSpan={5}>
        <$CalculatorText
          css={`
            font-weight: 500;
            margin: 0 0 ${theme.spacing.xs3} 0;
          `}
        >
          {t(`${translationsBase}.grantedPeriod`, { period: '2,03' })}
        </$CalculatorText>
        <div style={{ display: 'flex' }}>
          <DateInput
            id="date1"
            name="date1"
            placeholder="10.02.2021"
            onChange={noop}
            value=""
            required
            css={`
              margin-right: ${theme.spacing.xs3};
            `}
          />

          <DateInput
            id="date2"
            name="date2"
            placeholder="15.02.2021"
            onChange={noop}
            value=""
            required
          />
        </div>
      </$GridCell>

      <$GridCell $colStart={10} $colSpan={2}>
        <$ResetDatesWrapper>
          <IconArrowUndo />
          <$ResetLink aria-label={t(`${translationsBase}.reset`)} href="#">
            {t(`${translationsBase}.reset`)}
          </$ResetLink>
        </$ResetDatesWrapper>
      </$GridCell>

      <$GridCell $colStart={1}>
        <Button onClick={() => {}} theme="coat">
          {t(`${translationsBase}.calculate`)}
        </Button>
      </$GridCell>

      <$GridCell $colStart={1} $colSpan={11}>
        <$CalculatorHr />
      </$GridCell>

      <$GridCell $colSpan={7}>
        <$CalculatorTableRow>
          <$ViewField>{t(`${translationsBase}.salaryCosts`)}</$ViewField>
          <$ViewField>
            {t(`${translationsBase}.tableRowValue`, { amount: 500 })}
          </$ViewField>
        </$CalculatorTableRow>
        <$CalculatorTableRow isTotal>
          <$ViewFieldBold>{t(`${translationsBase}.maximumAid`)}</$ViewFieldBold>
          <$ViewFieldBold>
            {t(`${translationsBase}.tableRowValue`, { amount: 1015 })}
          </$ViewFieldBold>
        </$CalculatorTableRow>
      </$GridCell>

      <$GridCell $colStart={1} $colSpan={7}>
        <$CalculatorTableRow>
          <$ViewField>
            {t(`${translationsBase}.deductibleAllowances`)}
          </$ViewField>
          <$ViewField>
            {t(`${translationsBase}.tableRowValue`, { amount: 500 })}
          </$ViewField>
        </$CalculatorTableRow>
        <$CalculatorTableRow isTotal>
          <$ViewFieldBold>
            {t(`${translationsBase}.salarySupport`)}
          </$ViewFieldBold>
          <$ViewFieldBold>
            {t(`${translationsBase}.tableRowValue`, { amount: 1015 })}
          </$ViewFieldBold>
        </$CalculatorTableRow>
      </$GridCell>

      <$GridCell $colStart={1} $colSpan={7}>
        <$CalculatorTableRow>
          <$ViewField>{t(`${translationsBase}.tableRowHeader`)}</$ViewField>
          <$ViewField>
            {t(`${translationsBase}.tableRowValue`, { amount: 500 })}
          </$ViewField>
        </$CalculatorTableRow>
        <$CalculatorTableRow isTotal>
          <$ViewFieldBold>
            {t(`${translationsBase}.tableTotalHeader`)}
          </$ViewFieldBold>
          <$ViewFieldBold>
            {t(`${translationsBase}.tableRowValue`, { amount: 1015 })}
          </$ViewFieldBold>
        </$CalculatorTableRow>
      </$GridCell>
    </ReviewSection>
  );
};

export default SalaryBenefitCalculatorView;
