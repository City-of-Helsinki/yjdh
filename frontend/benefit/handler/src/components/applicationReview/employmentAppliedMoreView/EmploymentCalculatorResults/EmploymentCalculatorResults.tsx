import { ApplicationReviewViewProps } from 'benefit/handler/types/application';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import { $ViewField } from 'shared/components/benefit/summaryView/SummaryView.sc';
import {
  $Grid,
  $GridCell,
} from 'shared/components/forms/section/FormSection.sc';
import { formatStringFloatValue } from 'shared/utils/string.utils';

import { $CalculatorTableRow } from '../../ApplicationReview.sc';

const EmploymentCalculatorResults: React.FC<ApplicationReviewViewProps> = ({
  data,
}) => {
  const translationsBase = 'common:calculators.employment';
  const { t } = useTranslation();
  return (
    <$GridCell $colSpan={11}>
      {data?.calculation?.rows &&
        data?.calculation?.rows.map((row, i, { length }) => {
          const isTotal = length - 1 === i;
          return (
            <$Grid key={row.id}>
              <$GridCell $colSpan={6}>
                <$CalculatorTableRow isTotal={isTotal}>
                  <$ViewField isBold={isTotal}>{row.descriptionFi}</$ViewField>
                  <$ViewField isBold={isTotal}>
                    {t(`${translationsBase}.tableRowValue`, {
                      amount: formatStringFloatValue(row.amount),
                    })}
                  </$ViewField>
                </$CalculatorTableRow>
              </$GridCell>
            </$Grid>
          );
        })}
    </$GridCell>
  );
};

export default EmploymentCalculatorResults;
