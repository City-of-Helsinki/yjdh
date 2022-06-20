import ReviewSection from 'benefit/handler/components/reviewSection/ReviewSection';
import { ApplicationReviewViewProps } from 'benefit/handler/types/application';
import { APPLICATION_STATUSES, BENEFIT_TYPES } from 'benefit-shared/constants';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import {
  $ViewField,
  $ViewFieldBold,
} from 'shared/components/benefit/summaryView/SummaryView.sc';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { getFullName } from 'shared/utils/application.utils';
import {
  convertToUIDateFormat,
  diffMonths,
  parseDate,
} from 'shared/utils/date.utils';
import { useTheme } from 'styled-components';

import EmploymentCalculatorResults from '../employmentAppliedMoreView/EmploymentCalculatorResults/EmploymentCalculatorResults';
import SalaryCalculatorResults from '../salaryBenefitCalculatorView/SalaryCalculatorResults/SalaryCalculatorResults';

const HandledView: React.FC<ApplicationReviewViewProps> = ({ data }) => {
  const translationsBase = 'common:review.summary';
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <ReviewSection
      withMargin
      header={t(`${translationsBase}.${data.status || ''}.title`)}
    >
      <$GridCell $colSpan={8}>
        <$ViewField>
          {t(`${translationsBase}.${data.status || ''}.description`, {
            months: diffMonths(
              parseDate(data.calculation?.endDate),
              parseDate(data.calculation?.startDate)
            ),
            startDate: convertToUIDateFormat(data.calculation?.startDate),
            endDate: convertToUIDateFormat(data.calculation?.endDate),
          })}
        </$ViewField>
      </$GridCell>
      {data.latestDecisionComment && (
        <$GridCell $colSpan={12}>
          <$ViewFieldBold>
            {t(`${translationsBase}.${data.status || ''}.commentsTitle`)}
          </$ViewFieldBold>
          <$ViewField>{data.latestDecisionComment}</$ViewField>
        </$GridCell>
      )}
      {data.status === APPLICATION_STATUSES.ACCEPTED && (
        <>
          <$GridCell
            $colSpan={8}
            css={`
              margin: ${theme.spacing.s} 0;
            `}
          >
            {data.benefitType === BENEFIT_TYPES.EMPLOYMENT && (
              <EmploymentCalculatorResults data={data} />
            )}
            {data.benefitType === BENEFIT_TYPES.SALARY && (
              <SalaryCalculatorResults data={data} />
            )}
          </$GridCell>
          <$GridCell $colSpan={12}>
            <$ViewField>
              {t(`${translationsBase}.${data.status}.deMinimis`)}
              {': '}
              <$ViewFieldBold>
                {t(
                  `common:utility.${
                    data.calculation?.grantedAsDeMinimisAid ? 'yes' : 'no'
                  }`
                )}
              </$ViewFieldBold>
            </$ViewField>
          </$GridCell>
        </>
      )}
      <$GridCell $colSpan={12}>
        <$ViewField>
          {t(`${translationsBase}.common.handler`)}
          {': '}
          <$ViewFieldBold>
            {getFullName(
              data.calculation?.handlerDetails.firstName,
              data.calculation?.handlerDetails.lastName
            )}
          </$ViewFieldBold>
        </$ViewField>
      </$GridCell>
      <$GridCell $colSpan={12}>
        <$ViewField>
          {t(`${translationsBase}.common.handledAt`)}
          {': '}
          <$ViewFieldBold>
            {convertToUIDateFormat(data.handledAt)}
          </$ViewFieldBold>
        </$ViewField>
      </$GridCell>
    </ReviewSection>
  );
};

export default HandledView;
