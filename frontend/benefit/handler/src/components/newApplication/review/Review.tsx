import { DynamicFormStepComponentProps } from 'benefit/handler/types/common';
import React from 'react';

import AttachmentsSection from './attachmentsSection/AttachmentsSection';
import CompanySection from './companySection/CompanySection';
import EmployeeSection from './employeeSection/EmployeeSection';
import EmploymentSection from './employmentSection/EmploymentSection';
import PaperSection from './paperSection/PaperSection';
import TermsSection from './termsSection/TermsSection';

const Review: React.FC<DynamicFormStepComponentProps> = ({
  data,
  dispatchStep,
  fields,
}) => {
  const translationsBase = 'common:applications.sections';

  return (
    <>
      <PaperSection
        data={data}
        fields={fields}
        translationsBase={translationsBase}
        dispatchStep={dispatchStep}
      />
      <CompanySection
        data={data}
        fields={fields}
        translationsBase={translationsBase}
        dispatchStep={dispatchStep}
      />
      <EmployeeSection
        data={data}
        fields={fields}
        translationsBase={translationsBase}
        dispatchStep={dispatchStep}
      />
      <EmploymentSection
        data={data}
        fields={fields}
        translationsBase={translationsBase}
        dispatchStep={dispatchStep}
      />
      <AttachmentsSection
        data={data}
        fields={fields}
        translationsBase={translationsBase}
        dispatchStep={dispatchStep}
      />
      <TermsSection
        data={data}
        fields={fields}
        translationsBase={translationsBase}
        dispatchStep={dispatchStep}
      />
    </>
  );
};

export default Review;
