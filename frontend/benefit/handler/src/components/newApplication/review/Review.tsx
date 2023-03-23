import { DynamicFormStepComponentProps } from 'benefit/handler/types/common';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';

import { $ViewField, $ViewFieldBold } from '../ApplicationForm.sc';
import AttachmentsSection from './attachmentsSection/AttachmentsSection';
import CompanySection from './companySection/CompanySection';
import DeMinimisSection from './deMinimisSection/DeMinimisSection';
import EmployeeSection from './employeeSection/EmployeeSection';
import EmploymentSection from './employmentSection/EmploymentSection';
import SummarySection from './summarySection/SummarySection';

const Review: React.FC<DynamicFormStepComponentProps> = ({ data }) => {
  const translationsBase = 'common:applications.sections';
  const { t } = useTranslation();

  return (
    <>
      <CompanySection data={data} translationsBase={translationsBase} />
      <DeMinimisSection data={data} translationsBase={translationsBase} />
      <SummarySection header={t(`${translationsBase}.headings.company4`)}>
        <$GridCell $colStart={1} $colSpan={12}>
          {t(`${translationsBase}.fields.coOperationNegotiations.label`)}{' '}
          <$ViewFieldBold>
            {t(
              `${translationsBase}.fields.coOperationNegotiations.${
                data.coOperationNegotiations ? 'yes' : 'no'
              }`
            )}
          </$ViewFieldBold>
          <$ViewField>{data.coOperationNegotiationsDescription}</$ViewField>
        </$GridCell>
      </SummarySection>
      <EmployeeSection data={data} translationsBase={translationsBase} />
      <EmploymentSection data={data} translationsBase={translationsBase} />
      <AttachmentsSection data={data} translationsBase={translationsBase} />
    </>
  );
};

export default Review;
