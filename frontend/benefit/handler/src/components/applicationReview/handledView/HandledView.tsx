import {
  $ViewField,
  $ViewFieldBold,
} from 'benefit/handler/components/newApplication/ApplicationForm.sc';
import ReviewSection from 'benefit/handler/components/reviewSection/ReviewSection';
import { ApplicationReviewViewProps } from 'benefit/handler/types/application';
import { extractCalculatorRows } from 'benefit/handler/utils/calculator';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { getFullName } from 'shared/utils/application.utils';
import { convertToUIDateFormat } from 'shared/utils/date.utils';
import { formatFloatToCurrency } from 'shared/utils/string.utils';
import { useTheme } from 'styled-components';

import { $HandledHr, $HandledRow, $HandledSection } from './HandledView.sc';

const HandledView: React.FC<ApplicationReviewViewProps> = ({ data }) => {
  const translationsBase = 'common:review.summary';
  const { t } = useTranslation();
  const theme = useTheme();
  const { totalRow, dateRangeRows, helsinkiBenefitMonthlyRows } =
    extractCalculatorRows(data.calculation?.rows);

  return (
    <ReviewSection header={t(`${translationsBase}.${data.status || ''}.title`)}>
      <$HandledSection>
        <$GridCell $colSpan={8}>
          <$ViewFieldBold style={{ color: theme.colors.coatOfArms }}>
            {t(`${translationsBase}.common.ready`)}
          </$ViewFieldBold>
        </$GridCell>
        <$GridCell $colSpan={8}>
          <$ViewFieldBold large>
            {t(`${translationsBase}.${data.status || ''}.message`)}
          </$ViewFieldBold>
        </$GridCell>
        <$HandledHr dashed />
        <$GridCell $colSpan={8}>
          <$ViewFieldBold>
            {t(`${translationsBase}.${data.status || ''}.description`, {
              months: data.calculation?.durationInMonthsRounded,
              startDate: convertToUIDateFormat(data.calculation?.startDate),
              endDate: convertToUIDateFormat(data.calculation?.endDate),
            })}
          </$ViewFieldBold>
        </$GridCell>
        {dateRangeRows.length === helsinkiBenefitMonthlyRows.length &&
          dateRangeRows.map((row, index) => (
            <$HandledRow key={row.id}>
              <$GridCell $colSpan={8} $colStart={1}>
                <$ViewField large>
                  {t(`${translationsBase}.common.dateRange`, {
                    dateRange: row.descriptionFi.toLocaleLowerCase(),
                  })}
                </$ViewField>
              </$GridCell>
              <$GridCell $colSpan={2}>
                <$ViewFieldBold large>
                  {formatFloatToCurrency(
                    helsinkiBenefitMonthlyRows[index].amount,
                    'EUR',
                    'fi-FI',
                    0
                  )}
                  {t('common:utility.perMonth')}
                </$ViewFieldBold>
              </$GridCell>
            </$HandledRow>
          ))}
        <$HandledRow>
          <$GridCell
            style={{ backgroundColor: theme.colors.white }}
            $colSpan={8}
            $colStart={1}
          >
            <$ViewField large>
              {t(`${translationsBase}.common.total`, {
                months: data.calculation?.durationInMonthsRounded,
              })}
            </$ViewField>
          </$GridCell>
          <$GridCell
            style={{ backgroundColor: theme.colors.white }}
            $colSpan={2}
          >
            <$ViewFieldBold large>
              {formatFloatToCurrency(totalRow.amount, 'EUR', 'fi-FI', 0)}
              {t('common:utility.perMonth')}
            </$ViewFieldBold>
          </$GridCell>
        </$HandledRow>
        {data.status === APPLICATION_STATUSES.ACCEPTED && (
          <$HandledRow largeMargin>
            <$GridCell $colSpan={12}>
              <$ViewFieldBold>
                {t(`${translationsBase}.${data.status}.deMinimis`)}
                <$ViewField>
                  {t(
                    `common:utility.${
                      data.calculation?.grantedAsDeMinimisAid ? 'yes' : 'no'
                    }`
                  )}
                </$ViewField>
              </$ViewFieldBold>
            </$GridCell>
          </$HandledRow>
        )}
        {data.latestDecisionComment && (
          <$HandledRow largeMargin>
            <$GridCell $colSpan={12}>
              <$ViewFieldBold>
                {t(`${translationsBase}.${data.status || ''}.commentsTitle`)}
              </$ViewFieldBold>
              <$ViewField>{data.latestDecisionComment}</$ViewField>
            </$GridCell>
          </$HandledRow>
        )}
        <$HandledHr />
        <$HandledRow largeMargin>
          <$GridCell $colSpan={4} $colStart={1}>
            <$ViewFieldBold>
              {t(`${translationsBase}.common.handler`)}
              <$ViewField>
                {getFullName(
                  data.calculation?.handlerDetails.firstName,
                  data.calculation?.handlerDetails.lastName
                )}
              </$ViewField>
            </$ViewFieldBold>
          </$GridCell>
          <$GridCell $colSpan={4}>
            <$ViewFieldBold>
              {t(`${translationsBase}.common.handledAt`)}
              <$ViewField>{convertToUIDateFormat(data.handledAt)}</$ViewField>
            </$ViewFieldBold>
          </$GridCell>
        </$HandledRow>
      </$HandledSection>
    </ReviewSection>
  );
};

export default HandledView;
