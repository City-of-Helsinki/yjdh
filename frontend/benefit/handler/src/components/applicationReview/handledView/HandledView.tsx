import {
  $ViewField,
  $ViewFieldBold,
} from 'benefit/handler/components/applicationForm/ApplicationForm.sc';
import ReviewSection from 'benefit/handler/components/reviewSection/ReviewSection';
import StatusLabel from 'benefit/handler/components/statusLabel/StatusLabel';
import { ApplicationReviewViewProps } from 'benefit/handler/types/application';
import { extractCalculatorRows } from 'benefit/handler/utils/calculator';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { getFullName } from 'shared/utils/application.utils';
import { convertToUIDateFormat } from 'shared/utils/date.utils';
import { formatFloatToEvenEuros } from 'shared/utils/string.utils';
import { useTheme } from 'styled-components';

import {
  $HandledHeader,
  $HandledHr,
  $HandledRow,
  $HandledSection,
} from './HandledView.sc';

const HandledView: React.FC<ApplicationReviewViewProps> = ({ data }) => {
  const translationsBase = 'common:review.summary';
  const { t } = useTranslation();
  const theme = useTheme();
  const { totalRow, dateRangeRows, helsinkiBenefitMonthlyRows } =
    extractCalculatorRows(data.calculation?.rows);

  return (
    <ReviewSection
      withoutDivider
      header={t(`${translationsBase}.${data.status || ''}.title`)}
    >
      <$HandledSection>
        <$HandledHeader>
          <$ViewFieldBold style={{ color: theme.colors.coatOfArms }}>
            {t(`${translationsBase}.common.ready`)}
          </$ViewFieldBold>
          <StatusLabel status={data.status} />
        </$HandledHeader>
        <$HandledHr dashed />
        {data.status === APPLICATION_STATUSES.ACCEPTED && (
          <$GridCell $colSpan={8}>
            <$ViewFieldBold>
              {t(`${translationsBase}.accepted.description`, {
                months: data.calculation?.durationInMonthsRounded,
                startDate: convertToUIDateFormat(data.calculation?.startDate),
                endDate: convertToUIDateFormat(data.calculation?.endDate),
              })}
            </$ViewFieldBold>
          </$GridCell>
        )}
        {data.calculation?.overrideMonthlyBenefitAmount && (
          <$HandledRow key="manual-calculation-per-month">
            <$GridCell $colSpan={9} $colStart={1}>
              <$ViewField large>
                {t(`${translationsBase}.common.dateRange`, {
                  dateRange: dateRangeRows
                    .at(0)
                    ?.descriptionFi.toLocaleLowerCase(),
                })}{' '}
                ({t('calculators.salary.manualInput').toLowerCase()})
              </$ViewField>
            </$GridCell>
            <$GridCell $colSpan={2}>
              <$ViewFieldBold large>
                {formatFloatToEvenEuros(
                  data.calculation?.overrideMonthlyBenefitAmount
                )}
                {t('common:utility.perMonth')}
              </$ViewFieldBold>
            </$GridCell>
          </$HandledRow>
        )}
        {data.status === APPLICATION_STATUSES.ACCEPTED &&
          helsinkiBenefitMonthlyRows.map((row, index) => (
            <$HandledRow key={row.id}>
              <$GridCell $colSpan={9} $colStart={1}>
                <$ViewField large>
                  {t(`${translationsBase}.common.dateRange`, {
                    dateRange:
                      dateRangeRows[index]?.descriptionFi.toLocaleLowerCase(),
                  })}
                </$ViewField>
              </$GridCell>
              <$GridCell $colSpan={2}>
                <$ViewFieldBold large>
                  {formatFloatToEvenEuros(row.amount)}
                  {t('common:utility.perMonth')}
                </$ViewFieldBold>
              </$GridCell>
            </$HandledRow>
          ))}
        {data.status === APPLICATION_STATUSES.ACCEPTED && (
          <$HandledRow>
            <$GridCell
              style={{ backgroundColor: theme.colors.white }}
              $colSpan={9}
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
                {formatFloatToEvenEuros(totalRow?.amount || 0)}
              </$ViewFieldBold>
            </$GridCell>
          </$HandledRow>
        )}
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
              <$ViewField topMargin>{data.latestDecisionComment}</$ViewField>
            </$GridCell>
          </$HandledRow>
        )}
        <$HandledHr />
        <$HandledRow largeMargin>
          <$GridCell $colSpan={4} $colStart={1}>
            <$ViewFieldBold>
              {t(`${translationsBase}.common.handler`)}
              <$ViewField topMargin>
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
              <$ViewField topMargin>
                {convertToUIDateFormat(data.handledAt)}
              </$ViewField>
            </$ViewFieldBold>
          </$GridCell>
        </$HandledRow>
      </$HandledSection>
    </ReviewSection>
  );
};

export default HandledView;
