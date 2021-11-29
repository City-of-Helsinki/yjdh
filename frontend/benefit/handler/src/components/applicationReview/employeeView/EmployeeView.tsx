import ReviewSection from 'benefit/handler/components/reviewSection/ReviewSection';
import { ApplicationReviewViewProps } from 'benefit/handler/types/application';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import {
  $ViewField,
  $ViewFieldBold,
} from 'shared/components/benefit/summaryView/SummaryView.sc';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { getFullName } from 'shared/utils/application.utils';

const EmployeeView: React.FC<ApplicationReviewViewProps> = ({ data }) => {
  const translationsBase = 'common:review';
  const { t } = useTranslation();
  return (
    <ReviewSection header={t(`${translationsBase}.headings.heading5`)}>
      <$GridCell $colSpan={3}>
        <$ViewField>
          {getFullName(data.employee?.firstName, data.employee?.lastName)}
        </$ViewField>
        <$ViewField>{data.employee?.socialSecurityNumber}</$ViewField>
        <$ViewField>{data.employee?.phoneNumber}</$ViewField>
        <$ViewField>
          {t(`${translationsBase}.fields.isLivingInHelsinki`)}
          {': '}
          <$ViewFieldBold>{` ${t(
            `common:utility.${data.employee?.isLivingInHelsinki ? 'yes' : 'no'}`
          )}`}</$ViewFieldBold>
        </$ViewField>
      </$GridCell>
    </ReviewSection>
  );
};

export default EmployeeView;
