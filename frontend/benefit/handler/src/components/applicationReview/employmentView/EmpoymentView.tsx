import {
  $ViewField,
  $ViewFieldBold,
} from 'benefit/handler/components/newApplication/ApplicationForm.sc';
import ReviewSection from 'benefit/handler/components/reviewSection/ReviewSection';
import { ApplicationReviewViewProps } from 'benefit/handler/types/application';
import {
  APPLICATION_STATUSES,
  ATTACHMENT_TYPES,
} from 'benefit-shared/constants';
import { paySubsidyTitle } from 'benefit-shared/utils/common';
import camelCase from 'lodash/camelCase';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { formatFloatToCurrency } from 'shared/utils/string.utils';

import AttachmentsListView from '../../attachmentsListView/AttachmentsListView';
import EmploymentActions from './employmentActions/EmploymentActions';

const EmploymentView: React.FC<ApplicationReviewViewProps> = ({
  data,
  isUploading,
  handleUpload,
}) => {
  const translationsBase = 'common:review';
  const { t } = useTranslation();
  return (
    <ReviewSection
      header={t(`${translationsBase}.headings.heading8`)}
      section="employment"
      action={
        data.status !== APPLICATION_STATUSES.RECEIVED ? (
          <EmploymentActions
            handleUpload={handleUpload}
            isUploading={isUploading}
          />
        ) : null
      }
    >
      <$GridCell $colSpan={6} $colStart={1}>
        <$ViewFieldBold>
          {t(`${translationsBase}.fields.jobTitle`)}
        </$ViewFieldBold>
        <$ViewField>{data.employee?.jobTitle || '-'}</$ViewField>
      </$GridCell>
      <$GridCell $colSpan={6}>
        <$ViewFieldBold>
          {t(`${translationsBase}.fields.workingHours`)}
        </$ViewFieldBold>
        <$ViewField>
          {parseFloat(data.employee?.workingHours).toLocaleString('fi-FI')}{' '}
          {t(`${translationsBase}.fields.workingHours`)}
        </$ViewField>
      </$GridCell>
      <$GridCell $colSpan={6} $colStart={1}>
        <$ViewFieldBold>
          {t(`${translationsBase}.fields.monthlyPay`)}
        </$ViewFieldBold>
        <$ViewField>
          {data.employee?.monthlyPay &&
            t(`${translationsBase}.fields.monthlyPayText`, {
              monthlyPay: formatFloatToCurrency(
                data.employee.monthlyPay,
                'EUR',
                'FI-fi',
                0
              ),
            })}
        </$ViewField>
      </$GridCell>
      <$GridCell $colSpan={6}>
        <$ViewFieldBold>
          {t(`${translationsBase}.fields.vacationMoney`)}
        </$ViewFieldBold>
        <$ViewField>
          {data.employee?.vacationMoney &&
            t(`${translationsBase}.fields.vacationMoneyText`, {
              vacationMoney: formatFloatToCurrency(
                data.employee.vacationMoney,
                'EUR',
                'FI-fi',
                0
              ),
            })}
        </$ViewField>
      </$GridCell>
      <$GridCell $colSpan={6} $colStart={1}>
        <$ViewFieldBold>
          {t(`${translationsBase}.fields.otherExpenses`)}
        </$ViewFieldBold>
        <$ViewField>
          {data.employee?.otherExpenses &&
            t(`${translationsBase}.fields.otherExpensesText`, {
              otherExpenses: formatFloatToCurrency(
                data.employee.otherExpenses,
                'EUR',
                'FI-fi',
                0
              ),
            })}
        </$ViewField>
      </$GridCell>
      <$GridCell $colSpan={6}>
        <$ViewFieldBold>
          {t(`${translationsBase}.fields.collectiveBargainingAgreement`)}
        </$ViewFieldBold>
        <$ViewField>{data.employee?.collectiveBargainingAgreement}</$ViewField>
      </$GridCell>
      <$GridCell $colSpan={6} $colStart={1}>
        <$ViewFieldBold>
          {t(`${translationsBase}.fields.paySubsidyGranted.label`)}
        </$ViewFieldBold>
        <$ViewField>
          {t(
            `${translationsBase}.fields.paySubsidyGranted.${camelCase(
              data.paySubsidyGranted
            )}`
          )}
        </$ViewField>
      </$GridCell>
      <$GridCell $colSpan={6}>
        <$ViewFieldBold>
          {t(`${translationsBase}.fields.apprenticeshipProgram`)}{' '}
        </$ViewFieldBold>
        <$ViewField>
          {t(`common:utility.${data.apprenticeshipProgram ? 'yes' : 'no'}`)}
        </$ViewField>
      </$GridCell>
      <AttachmentsListView
        title={t(
          'common:applications.sections.attachments.types.employmentContract.title'
        )}
        type={ATTACHMENT_TYPES.EMPLOYMENT_CONTRACT}
        attachments={data.attachments || []}
      />
      <AttachmentsListView
        title={t(paySubsidyTitle(data.paySubsidyGranted))}
        type={ATTACHMENT_TYPES.PAY_SUBSIDY_CONTRACT}
        attachments={data.attachments || []}
      />
      <AttachmentsListView
        title={t(
          'common:applications.sections.attachments.types.educationContract.title'
        )}
        type={ATTACHMENT_TYPES.EDUCATION_CONTRACT}
        attachments={data.attachments || []}
      />
      <AttachmentsListView
        title={t(
          'common:applications.sections.attachments.types.otherAttachment.title'
        )}
        type={ATTACHMENT_TYPES.OTHER_ATTACHMENT}
        attachments={data.attachments || []}
      />
    </ReviewSection>
  );
};

export default EmploymentView;
