import { Button } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import FormSection from 'shared/components/forms/section/FormSection';
import TetPosting from 'tet/admin/types/tetposting';

const ActionButtons: React.FC = () => {
  const { t } = useTranslation();
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useFormContext<TetPosting>();

  const handleSuccess = (validatedPosting: TetPosting): void => {
    console.log(validatedPosting);
  };
  return (
    <FormSection>
      <Button type="submit" disabled={isSubmitting} onClick={handleSubmit(handleSuccess)}>
        {t('common:editor.saveDraft')}
      </Button>
    </FormSection>
  );
};

export default ActionButtons;
