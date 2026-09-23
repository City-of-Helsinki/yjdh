import AssignmentControls from 'kesaseteli/handler/components/assignment/AssignmentControls';
import {
  APPLICATION_LIST_TYPES,
  isHandledEmployerApplicationStatus,
} from 'kesaseteli/handler/types/application';
import HandlerEmployerApplication from 'kesaseteli/handler/types/HandlerEmployerApplication';
import { useTranslation } from 'next-i18next';
import React from 'react';
import FormSection from 'shared/components/forms/section/FormSection';
import FormSectionHeading from 'shared/components/forms/section/FormSectionHeading';
import { convertToUIDateFormat } from 'shared/utils/date.utils';

import Field, { $DescriptionList } from '../form/Field';

const EmployerApplicationStatusSection: React.FC<{
  application: HandlerEmployerApplication;
  withoutTitle?: boolean;
}> = ({ application, withoutTitle = false }) => {
  const { t } = useTranslation();
  const sectionTitle = t('common:handlerApplication.application');

  return (
    <FormSection columns={1} withoutDivider>
      {!withoutTitle && (
        <FormSectionHeading
          aria-label={sectionTitle}
          header={sectionTitle}
          as="h4"
        />
      )}
      <$DescriptionList aria-label={sectionTitle}>
        {!isHandledEmployerApplicationStatus(application.status) && (
          <Field
            type="assignee"
            value={
              <AssignmentControls
                id={application.id}
                assignee={application.assignee}
                modified_at={application.modified_at}
                applicationType={APPLICATION_LIST_TYPES.EMPLOYER}
              />
            }
          />
        )}
        <Field
          type="status"
          value={t(
            `common:applicationList.employer.status.${application.status}`
          )}
        />
        <Field
          type="submitted_at"
          value={convertToUIDateFormat(application.submitted_at) || '-'}
        />
      </$DescriptionList>
    </FormSection>
  );
};

export default EmployerApplicationStatusSection;
