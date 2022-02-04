import ReviewSection from 'benefit/handler/components/reviewSection/ReviewSection';
import { ApplicationReviewViewProps } from 'benefit/handler/types/application';
import { Button, DateInput } from 'hds-react';
import camelCase from 'lodash/camelCase';
import * as React from 'react';
import { $ViewField } from 'shared/components/benefit/summaryView/SummaryView.sc';
import { DateFieldsSeparator } from 'shared/components/forms/fields/dateFieldsSeparator/DateFieldsSeparator';
import {
  $Grid,
  $GridCell,
} from 'shared/components/forms/section/FormSection.sc';
import { formatStringFloatValue } from 'shared/utils/string.utils';

import {
  $CalculatorHr,
  $CalculatorTableRow,
  $CalculatorText,
} from '../ApplicationReview.sc';
import CalculatorErrors from '../calculatorErrors/CalculatorErrors';
import { useEmploymentAppliedMoreView } from './useEmploymentAppliedMoreView';

const EmploymentAppliedMoreView: React.FC<ApplicationReviewViewProps> = ({
  data,
}) => {
  const {
    t,
    translationsBase,
    theme,
    formik,
    fields,
    language,
    grantedPeriod,
    calculationsErrors,
    getErrorMessage,
    handleSubmit,
  } = useEmploymentAppliedMoreView(data);
  return (
    <form onSubmit={handleSubmit} noValidate>
      <ReviewSection withMargin>
        <$GridCell $colSpan={6}>
          <$CalculatorText>{t(`${translationsBase}.header`)}</$CalculatorText>
          <$ViewField>
            {formik.values.startDate && formik.values.endDate && (
              <>
                {t(`${translationsBase}.startEndDates`, {
                  startDate: formik.values.startDate,
                  endDate: formik.values.endDate,
                  period: formatStringFloatValue(grantedPeriod),
                })}
              </>
            )}
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
            {t(`${translationsBase}.grantedPeriod`, {
              period: formatStringFloatValue(grantedPeriod),
            })}
          </$CalculatorText>
        </$GridCell>

        <$GridCell
          $colStart={1}
          $colSpan={5}
          style={{ display: 'flex', alignItems: 'center' }}
        >
          <DateInput
            id={fields.startDate.name}
            name={fields.startDate.name}
            placeholder={fields.startDate.placeholder}
            language={language}
            onBlur={formik.handleBlur}
            onChange={(value) => {
              formik.setFieldValue(fields.startDate.name, value);
            }}
            value={formik.values.startDate ?? ''}
            invalid={!!getErrorMessage(fields.startDate.name)}
            aria-invalid={!!getErrorMessage(fields.startDate.name)}
            errorText={getErrorMessage(fields.startDate.name)}
          />

          <DateFieldsSeparator />

          <DateInput
            id={fields.endDate.name}
            name={fields.endDate.name}
            placeholder={fields.endDate.placeholder}
            language={language}
            onBlur={formik.handleBlur}
            onChange={(value) => {
              formik.setFieldValue(fields.endDate.name, value);
            }}
            value={formik.values.endDate ?? ''}
            invalid={!!getErrorMessage(fields.endDate.name)}
            aria-invalid={!!getErrorMessage(fields.endDate.name)}
            errorText={getErrorMessage(fields.endDate.name)}
          />
        </$GridCell>

        <$GridCell
          css={`
            margin-top: ${theme.spacing.m};
            margin-bottom: ${theme.spacing.xs};
          `}
          $colSpan={11}
        >
          <Button theme="coat" onClick={handleSubmit}>
            {t(`${translationsBase}.calculate`)}
          </Button>
        </$GridCell>
        <$GridCell $colSpan={11}>
          <$CalculatorHr />
          <CalculatorErrors data={calculationsErrors} />
          {data?.calculation?.rows &&
            data?.calculation?.rows.map((row, i, { length }) => {
              const isTotal = length - 1 === i;
              return (
                <$Grid key={camelCase(row.descriptionFi)}>
                  <$GridCell $colSpan={6}>
                    <$CalculatorTableRow isTotal={isTotal}>
                      <$ViewField isBold={isTotal}>
                        {row.descriptionFi}
                      </$ViewField>
                      <$ViewField isBold={isTotal}>
                        {t(`${translationsBase}.tableRowValue`, {
                          amount: row.amount,
                        })}
                      </$ViewField>
                    </$CalculatorTableRow>
                  </$GridCell>
                </$Grid>
              );
            })}
        </$GridCell>
      </ReviewSection>
    </form>
  );
};

export default EmploymentAppliedMoreView;
