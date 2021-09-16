import {
  $ButtonSection,
  $PrimaryButton,
} from 'kesaseteli/employer/components/application/form/ActionButtons.sc';
import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import Application from 'shared/types/employer-application';

const AddNewEmploymentButton: React.FC = () => {
  const { t } = useTranslation();
  const { getValues } = useFormContext<Application>();
  const { addEmployment } = useApplicationApi();

  const addNewEmployment = React.useCallback(() => {
    addEmployment(getValues());
  }, [addEmployment, getValues]);

  return (
    <$ButtonSection columns={1}>
    <$GridCell>
      <$PrimaryButton data-testid="add-employment" onClick={addNewEmployment}>
        {t(`common:application.step2.add_employment`)}
      </$PrimaryButton>
    </$GridCell>
    </$ButtonSection>
  );
};
export default AddNewEmploymentButton;
