import { Button, IconTrash } from 'hds-react';
import useAccordionStateLocalStorage from 'kesaseteli/employer/hooks/application/useAccordionStateLocalStorage';
import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import useValidateEmployment from 'kesaseteli/employer/hooks/employments/useValidateEmployment';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import Application from 'shared/types/employer-application';

type Props = {
  index: number;
  onSave: () => void;
};

const AccordionActionButtons: React.FC<Props> = ({ index, onSave }: Props) => {
  const { t } = useTranslation();
  const {
    formState: { isSubmitting },
    getValues,
  } = useFormContext<Application>();
  const { isLoading, updateApplication, removeEmployment } =
    useApplicationApi();

  const { removeFromStorage } = useAccordionStateLocalStorage(index);

  const update = React.useCallback(() => {
    onSave();
    updateApplication(getValues());
  }, [onSave, updateApplication, getValues]);

  const remove = React.useCallback(() => {
    removeFromStorage();
    removeEmployment(getValues(), index);
  }, [removeFromStorage, removeEmployment, getValues, index]);

  const validate = useValidateEmployment(index, { onSuccess: update });

  return (
    <>
      <$GridCell justifySelf="start">
        <Button
          variant="secondary"
          theme="black"
          data-testid={`update-employment-${index}`}
          onClick={validate}
          disabled={isLoading || isSubmitting}
        >
          {t(`common:application.step2.save_employment`)}
        </Button>
      </$GridCell>
      <$GridCell justifySelf="end">
        <Button
          variant="supplementary"
          theme="black"
          data-testid={`remove-employment-${index}`}
          iconLeft={<IconTrash />}
          onClick={remove}
          disabled={isLoading || isSubmitting}
        >
          {t(`common:application.step2.remove_employment`)}
        </Button>
      </$GridCell>
    </>
  );
};

export default AccordionActionButtons;
