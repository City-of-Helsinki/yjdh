import ReviewSection from 'benefit/handler/components/reviewSection/ReviewSection';
import {
  APPLICATION_STATUSES,
  ATTACHMENT_TYPES,
} from 'benefit/handler/constants';
import { ApplicationReviewViewProps } from 'benefit/handler/types/application';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import { $ViewField } from 'shared/components/benefit/summaryView/SummaryView.sc';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { formatStringFloatValue } from 'shared/utils/string.utils';

import AttachmentsListView from '../../attachmentsListView/AttachmentsListView';
import EmploymentActions from './employmentActions/EmploymentActions';

const EmploymentView: React.FC<ApplicationReviewViewProps> = ({ data }) => {
  const translationsBase = 'common:review';
  const { t } = useTranslation();
  return (
    <ReviewSection
      header={t(`${translationsBase}.headings.heading8`)}
      action={
        data.status !== APPLICATION_STATUSES.RECEIVED ? (
          <EmploymentActions />
        ) : null
      }
    >
      <$GridCell $colSpan={12}>
        <$ViewField>
          {`${t(`${translationsBase}.fields.jobTitle`)}: ${
            data.employee?.jobTitle || '-'
          }`}
        </$ViewField>
        <$ViewField>
          {t(`${translationsBase}.fields.workingHours`, {
            workingHours: formatStringFloatValue(data.employee?.workingHours),
          })}
        </$ViewField>
        <$ViewField>
          {t(`${translationsBase}.fields.monthlyPay`, {
            monthlyPay: formatStringFloatValue(data.employee?.monthlyPay),
          })}
        </$ViewField>
        <$ViewField>
          {t(`${translationsBase}.fields.otherExpenses`, {
            otherExpenses: formatStringFloatValue(data.employee?.otherExpenses),
          })}
        </$ViewField>
        <$ViewField
          css={`
            &&& {
              padding-bottom: 0;
            }
          `}
        >
          {t(`${translationsBase}.fields.vacationMoney`, {
            vacationMoney: formatStringFloatValue(data.employee?.vacationMoney),
          })}
        </$ViewField>
        <$ViewField>{data.employee?.collectiveBargainingAgreement}</$ViewField>
      </$GridCell>
      <AttachmentsListView
        title={t('common:attachments.types.employmentContract.title')}
        type={ATTACHMENT_TYPES.EMPLOYMENT_CONTRACT}
        attachments={data.attachments || []}
      />
    </ReviewSection>
  );
};

export default EmploymentView;
