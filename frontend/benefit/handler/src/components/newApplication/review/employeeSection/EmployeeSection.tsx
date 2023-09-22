import { ReviewChildProps } from 'benefit/handler/types/common';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';

import { $ViewField, $ViewFieldBold } from '../../ApplicationForm.sc';
import SummarySection from '../summarySection/SummarySection';

const EmploymentSection: React.FC<ReviewChildProps> = ({
  data,
  translationsBase,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <SummarySection
        header={t(`${translationsBase}.headings.employment1`)}
        withoutDivider
      >
        <$GridCell $colSpan={3}>
          <$ViewField>{`${data.employee?.firstName || ''} ${
            data.employee?.lastName || ''
          }`}</$ViewField>
          <$ViewField>{data.employee?.socialSecurityNumber}</$ViewField>
          <$ViewField>
            {t(`${translationsBase}.fields.isLivingInHelsinki.label`)}
            {': '}
            <$ViewFieldBold>
              {t(
                `${translationsBase}.fields.isLivingInHelsinki.${
                  data.employee?.isLivingInHelsinki ? 'yes' : 'no'
                }`
              )}
            </$ViewFieldBold>
          </$ViewField>
        </$GridCell>
      </SummarySection>

      <SummarySection
        header={t(`${translationsBase}.headings.employment2`)}
        withoutDivider
      >
        <$GridCell $colSpan={12}>
          {data.paySubsidyGranted ? (
            <>
              <$ViewFieldBold>
                {t(
                  `${translationsBase}.fields.paySubsidyGranted.${
                    data.paySubsidyGranted ? 'yes' : 'no'
                  }`
                )}
              </$ViewFieldBold>
              <$ViewField>
                {t(`${translationsBase}.fields.apprenticeshipProgram.label`)}{' '}
                <$ViewFieldBold>
                  {t(
                    `${translationsBase}.fields.apprenticeshipProgram.${
                      data.apprenticeshipProgram ? 'yes' : 'no'
                    }`
                  )}
                </$ViewFieldBold>
              </$ViewField>
            </>
          ) : (
            <$ViewField>
              {t(`${translationsBase}.fields.paySubsidyGranted.label`)}{' '}
              <$ViewFieldBold>
                {t(`${translationsBase}.fields.paySubsidyGranted.no`)}
              </$ViewFieldBold>
            </$ViewField>
          )}
        </$GridCell>
      </SummarySection>
    </>
  );
};

export default EmploymentSection;
