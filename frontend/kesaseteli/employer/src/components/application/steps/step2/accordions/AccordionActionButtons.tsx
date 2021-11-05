import { Button, IconTrash } from 'hds-react';
import useAccordionStateLocalStorage from 'kesaseteli/employer/hooks/application/useAccordionStateLocalStorage';
import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import useApplicationFormField from 'kesaseteli/employer/hooks/application/useApplicationFormField';
import useValidateEmployment from 'kesaseteli/employer/hooks/employments/useValidateEmployment';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import Application from 'shared/types/application-form-data';
import Employment from 'shared/types/employment';

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
  const { updateApplicationQuery, updateApplication, removeEmployment } =
    useApplicationApi();

  const { removeFromStorage } = useAccordionStateLocalStorage(index);

  const { getValue: getList } =
    useApplicationFormField<Employment[]>('summer_vouchers');
  const onlyOneEmployment = getList().length === 1;

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
          disabled={updateApplicationQuery.isLoading || isSubmitting}
        >
          {t(`common:application.step2.save_employment`)}
        </Button>
      </$GridCell>
      {!onlyOneEmployment && (
        <$GridCell justifySelf="end">
          <Button
            variant="supplementary"
            theme="black"
            data-testid={`remove-employment-${index}`}
            iconLeft={<IconTrash />}
            onClick={remove}
            disabled={updateApplicationQuery.isLoading || isSubmitting}
          >
            {t(`common:application.step2.remove_employment`)}
          </Button>
        </$GridCell>
      )}
    </>
  );
};

export default AccordionActionButtons;
