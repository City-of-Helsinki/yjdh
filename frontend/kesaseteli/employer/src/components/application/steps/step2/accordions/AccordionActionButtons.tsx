import { IconTrash } from 'hds-react';
import { $SecondaryButton } from 'kesaseteli/employer/components/application/form/ActionButtons.sc';
import useAccordionStateLocalStorage from 'kesaseteli/employer/hooks/application/useAccordionStateLocalStorage';
import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import Application from 'shared/types/employer-application';

import {
  $EmploymentAction,
  $EmploymentActions,
  $SupplementaryButton,
} from './EmploymentAccordion.sc';

type Props = {
  index: number;
};

const AccordionActionButtons: React.FC<Props> = ({ index }: Props) => {
  const { t } = useTranslation();
  const {
    formState: { isSubmitting },
    getValues,
  } = useFormContext<Application>();
  const { isLoading, updateApplication, removeEmployment } =
    useApplicationApi();

  const { persistToStorage, removeFromStorage } =
    useAccordionStateLocalStorage(index);

  const update = React.useCallback(() => {
    persistToStorage(false);
    updateApplication(getValues());
  }, [updateApplication, getValues, persistToStorage]);

  const remove = React.useCallback(() => {
    removeFromStorage();
    removeEmployment(getValues(), index);
  }, [removeEmployment, getValues, index, removeFromStorage]);

  return (
    <$EmploymentActions>
      <$EmploymentAction>
        <$SecondaryButton
          variant="secondary"
          data-testid={`update-employment-${index}`}
          onClick={update}
          disabled={isLoading || isSubmitting}
        >
          {t(`common:application.step2.save_employment`)}
        </$SecondaryButton>
      </$EmploymentAction>
      <$EmploymentAction>
        <$SupplementaryButton
          variant="supplementary"
          data-testid={`remove-employment-${index}`}
          iconLeft={<IconTrash />}
          onClick={remove}
          disabled={isLoading || isSubmitting}
        >
          {t(`common:application.step2.remove_employment`)}
        </$SupplementaryButton>
      </$EmploymentAction>
    </$EmploymentActions>
  );
};

export default AccordionActionButtons;
