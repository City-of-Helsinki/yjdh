import { DynamicFormStepComponentProps } from 'benefit/handler/types/common';
import React from 'react';

import AttachmentsSection from './attachmentsSection/AttachmentsSection';
import CompanySection from './companySection/CompanySection';
import EmployeeSection from './employeeSection/EmployeeSection';
import EmploymentSection from './employmentSection/EmploymentSection';

const Review: React.FC<DynamicFormStepComponentProps> = ({ data }) => {
  const translationsBase = 'common:applications.sections';

  return (
    <>
      <CompanySection data={data} translationsBase={translationsBase} />
      <EmployeeSection data={data} translationsBase={translationsBase} />
      <EmploymentSection data={data} translationsBase={translationsBase} />
      <AttachmentsSection data={data} translationsBase={translationsBase} />
    </>
  );
};

export default Review;
