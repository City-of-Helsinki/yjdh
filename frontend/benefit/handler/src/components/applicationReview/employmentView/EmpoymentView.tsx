import {
  $ViewField,
  $ViewFieldBold,
} from 'benefit/handler/components/applicationForm/ApplicationForm.sc';
import ReviewSection from 'benefit/handler/components/reviewSection/ReviewSection';
import { ACTIONLESS_STATUSES } from 'benefit/handler/constants';
import { ApplicationReviewViewProps } from 'benefit/handler/types/application';
import { ATTACHMENT_TYPES } from 'benefit-shared/constants';
import { paySubsidyTitle } from 'benefit-shared/utils/common';
import camelCase from 'lodash/camelCase';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { formatFloatToEvenEuros } from 'shared/utils/string.utils';

import AttachmentsListView from '../../attachmentsListView/AttachmentsListView';

const EmploymentView: React.FC<ApplicationReviewViewProps> = ({ data }) => {
  const translationsBase = 'common:review';
  const { t } = useTranslation();
  return (
    <ReviewSection
      id={data.id}
      header={t(`${translationsBase}.headings.heading8`)}
      section="employment"
      action={!ACTIONLESS_STATUSES.includes(data.status) ? true : null}
    >
      <$GridCell $colSpan={6} $colStart={1}>
        <$ViewFieldBold>
          {t(`${translationsBase}.fields.jobTitle`)}
        </$ViewFieldBold>
        <$ViewField large>{data.employee?.jobTitle || '-'}</$ViewField>
      </$GridCell>
      <$GridCell $colSpan={6}>
        <$ViewFieldBold>
          {t(`${translationsBase}.fields.workingHours`)}
        </$ViewFieldBold>
        <$ViewField large>
          {parseFloat(data.employee?.workingHours).toLocaleString('fi-FI')}{' '}
          {t(`${translationsBase}.fields.workingHoursText`)}
        </$ViewField>
      </$GridCell>
      <$GridCell $colSpan={6} $colStart={1}>
        <$ViewFieldBold>
          {t(`${translationsBase}.fields.monthlyPay`)}
        </$ViewFieldBold>
        <$ViewField large>
          {data.employee?.monthlyPay &&
            t(`${translationsBase}.fields.monthlyPayText`, {
              monthlyPay: formatFloatToEvenEuros(data.employee.monthlyPay),
            })}
        </$ViewField>
      </$GridCell>
      <$GridCell $colSpan={6}>
        <$ViewFieldBold>
          {t(`${translationsBase}.fields.vacationMoney`)}
        </$ViewFieldBold>
        <$ViewField large>
          {data.employee?.vacationMoney &&
            t(`${translationsBase}.fields.vacationMoneyText`, {
              vacationMoney: formatFloatToEvenEuros(
                data.employee.vacationMoney
              ),
            })}
        </$ViewField>
      </$GridCell>
      <$GridCell $colSpan={6} $colStart={1}>
        <$ViewFieldBold>
          {t(`${translationsBase}.fields.otherExpenses`)}
        </$ViewFieldBold>
        <$ViewField large>
          {data.employee?.otherExpenses &&
            t(`${translationsBase}.fields.otherExpensesText`, {
              otherExpenses: formatFloatToEvenEuros(
                data.employee.otherExpenses
              ),
            })}
        </$ViewField>
      </$GridCell>
      <$GridCell $colSpan={6}>
        <$ViewFieldBold>
          {t(`${translationsBase}.fields.collectiveBargainingAgreement`)}
        </$ViewFieldBold>
        <$ViewField large>
          {data.employee?.collectiveBargainingAgreement}
        </$ViewField>
      </$GridCell>
      <$GridCell $colSpan={6} $colStart={1}>
        <$ViewFieldBold>
          {t(`${translationsBase}.fields.paySubsidyGranted.label`)}
        </$ViewFieldBold>
        <$ViewField large>
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
        <$ViewField large>
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
