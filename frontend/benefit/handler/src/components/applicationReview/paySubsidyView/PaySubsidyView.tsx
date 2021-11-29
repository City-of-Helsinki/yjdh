import ReviewSection from 'benefit/handler/components/reviewSection/ReviewSection';
import { Application } from 'benefit/handler/types/application';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import {
  $ViewField,
  $ViewFieldBold,
} from 'shared/components/benefit/summaryView/SummaryView.sc';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';

export interface PaySubsidyViewProps {
  data: Application;
}

const PaySubsidyView: React.FC<PaySubsidyViewProps> = ({ data }) => {
  const translationsBase = 'common:review';
  const { t } = useTranslation();
  return (
    <>
      <ReviewSection header={t(`${translationsBase}.headings.heading6`)}>
        <$GridCell $colSpan={3}>
          {data.paySubsidyGranted && (
            <$ViewFieldBold>
              {t(`common:utility.${data.paySubsidyGranted ? 'yes' : 'no'}`)}
              <$ViewField isInline>{`, ${data.paySubsidyPercent || ''} % ${
                data.additionalPaySubsidyPercent
                  ? `${t('common:utility.and')} ${
                      data.additionalPaySubsidyPercent
                    } %`
                  : ''
              }`}</$ViewField>
            </$ViewFieldBold>
          )}

          <$ViewField>
            {t(`${translationsBase}.fields.apprenticeshipProgram`)}{' '}
            <$ViewFieldBold>
              {t(`common:utility.${data.apprenticeshipProgram ? 'yes' : 'no'}`)}
            </$ViewFieldBold>
          </$ViewField>
        </$GridCell>
      </ReviewSection>
    </>
  );
};

export default PaySubsidyView;
