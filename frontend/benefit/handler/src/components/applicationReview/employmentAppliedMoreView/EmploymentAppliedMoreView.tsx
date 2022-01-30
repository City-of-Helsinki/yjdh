import ReviewSection from 'benefit/handler/components/reviewSection/ReviewSection';
import { ApplicationReviewViewProps } from 'benefit/handler/types/application';
import { DateInput } from 'hds-react';
import { camelCase } from 'lodash';
import * as React from 'react';
import { $ViewField } from 'shared/components/benefit/summaryView/SummaryView.sc';
import {
  $Grid,
  $GridCell,
} from 'shared/components/forms/section/FormSection.sc';
import {
  $CalculatorHr,
  $CalculatorTableRow,
  $CalculatorText,
} from '../ApplicationReview.sc';
import { useEmploymentAppliedMoreView } from './useEmploymentAppliedMoreView';

const EmploymentAppliedMoreView: React.FC<ApplicationReviewViewProps> = ({
  data,
}) => {
  console.log(data);
  const {
    t,
    translationsBase,
    theme,
    formik,
    fields,
    getErrorMessage,
    language,
  } = useEmploymentAppliedMoreView(data);
  return (
    <ReviewSection withMargin>
      <$GridCell $colSpan={3}>
        <$CalculatorText>{t(`${translationsBase}.header`)}</$CalculatorText>
        <$ViewField>
          {formik.values.startDate && formik.values.endDate && (
            <>
              {t(`${translationsBase}.startEndDates`, {
                startDate: formik.values.startDate,
                endDate: formik.values.endDate,
                period: '2,03',
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
          {t(`${translationsBase}.grantedPeriod`, { period: '2,03' })}
        </$CalculatorText>
        <$Grid>
          <$GridCell $colStart={1} $colSpan={2}>
            <DateInput
              id={fields.startDate.name}
              name={fields.startDate.name}
              placeholder={fields.startDate.placeholder}
              language={'fi'}
              onBlur={formik.handleBlur}
              onChange={(value) =>
                formik.setFieldValue(fields.startDate.name, value)
              }
              value={formik.values.startDate ?? ''}
              invalid={!!getErrorMessage(fields.startDate.name)}
              aria-invalid={!!getErrorMessage(fields.startDate.name)}
              errorText={getErrorMessage(fields.startDate.name)}
            />
          </$GridCell>
          <$GridCell $colSpan={2}>
            <DateInput
              id={fields.endDate.name}
              name={fields.endDate.name}
              placeholder={fields.endDate.placeholder}
              language={'fi'}
              onBlur={formik.handleBlur}
              onChange={(value) =>
                formik.setFieldValue(fields.endDate.name, value)
              }
              value={formik.values.endDate ?? ''}
              invalid={!!getErrorMessage(fields.endDate.name)}
              aria-invalid={!!getErrorMessage(fields.endDate.name)}
              errorText={getErrorMessage(fields.endDate.name)}
              required
            />
          </$GridCell>
        </$Grid>
      </$GridCell>
      <$GridCell $colSpan={11}>
        <$CalculatorHr />
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
  );
};

export default EmploymentAppliedMoreView;
