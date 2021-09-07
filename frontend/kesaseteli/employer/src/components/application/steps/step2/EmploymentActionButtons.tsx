
import {
  $ApplicationAction,
  $ApplicationActions,
  $SecondaryButton,
} from 'kesaseteli/employer/components/application/form/ActionButtons.sc';
import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import { useTranslation } from 'next-i18next';
import React from 'react';
import {useFormContext} from 'react-hook-form';
import Application from 'shared/types/employer-application';

type Props = {
  index: number
}

const EmploymentActionButtons: React.FC<Props> = ({index}: Props) => {
  const { t } = useTranslation();
  const {
    formState: {isSubmitting},
  } =  useFormContext<Application>();
  const { isLoading,
    application,
    updateApplication,
    removeEmployment } = useApplicationApi();
  const {getValues} = useFormContext<Application>();

  const update = React.useCallback(() => {
    updateApplication(getValues());
  }, [updateApplication, getValues]);

  const remove = React.useCallback(() => {
    removeEmployment(getValues(), index);
  }, [removeEmployment, getValues, index]);

  return (
    <$ApplicationActions>
      <$ApplicationAction>
        <$SecondaryButton
          variant="secondary"
          data-testid={`update-employment-${index}`}
          onClick={update}
          disabled={isLoading || isSubmitting}
        >
          {t(`common:application.step2.save_employment`)}
        </$SecondaryButton>
      </$ApplicationAction>
      {application && application.summer_vouchers.length > 1 && <$ApplicationAction>
        <$SecondaryButton
          data-testid={`remove-employment-${index}`}
          onClick={remove}
          loadingText={t(`common:application.loading`)}
          isLoading={isLoading || isSubmitting}
          disabled={isLoading || isSubmitting}
        >
          {t(`common:application.step2.remove_employment`)}
        </$SecondaryButton>
      </$ApplicationAction>}
    </$ApplicationActions>
  );
};

export default EmploymentActionButtons;
