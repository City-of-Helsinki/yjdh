import { ROUTES } from 'benefit/applicant/constants';
import useFormActions from 'benefit/applicant/hooks/useFormActions';
import useUpdateApplicationQuery from 'benefit/applicant/hooks/useUpdateApplicationQuery';
import { useTranslation } from 'benefit/applicant/i18n';
import { getApplicationStepString } from 'benefit/applicant/utils/common';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { Application, ApplicationData } from 'benefit-shared/types/application';
import { useRouter } from 'next/router';
import { TFunction } from 'next-i18next';
import { useEffect } from 'react';
import hdsToast from 'shared/components/toast/Toast';
import { stringToFloatValue } from 'shared/utils/string.utils';
import snakecaseKeys from 'snakecase-keys';

type ExtendedComponentProps = {
  t: TFunction;
  handleSave: () => void;
  handleSubmit: () => void;
  handleBack: () => void;
  handleDelete: () => void;
  handleStepChange: (step: number) => void;
  handleClose: () => void;
  translationsBase: string;
  isSubmit: boolean;
};

const useApplicationFormStep5 = (
  application: Application,
  onSubmit?: () => void
): ExtendedComponentProps => {
  const translationsBase = 'common:applications.sections';
  const { t } = useTranslation();
  const router = useRouter();

  const { mutate: updateApplicationStep5, error: updateApplicationErrorStep5 } =
    useUpdateApplicationQuery();

  const isSubmit = !application?.applicantTermsApprovalNeeded;

  useEffect(() => {
    // todo:custom error messages
    if (updateApplicationErrorStep5) {
      hdsToast({
        autoDismissTime: 5000,
        type: 'error',
        labelText: t('common:error.generic.label'),
        text: t('common:error.generic.text'),
      });
    }
  }, [t, updateApplicationErrorStep5]);

  const { onBack, onSave, onDelete } = useFormActions(application);

  const handleStepChange = (nextStep: number): void => {
    const currentApplicationData = snakecaseKeys(
      {
        ...application,
        applicationStep: getApplicationStepString(nextStep),
        calculation: application.calculation
          ? {
              ...application.calculation,
              monthlyPay: stringToFloatValue(
                application.calculation.monthlyPay
              ),
              otherExpenses: stringToFloatValue(
                application.calculation.otherExpenses
              ),
              vacationMoney: stringToFloatValue(
                application.calculation.vacationMoney
              ),
              overrideMonthlyBenefitAmount: stringToFloatValue(
                application.calculation.overrideMonthlyBenefitAmount
              ),
            }
          : undefined,
      },
      { deep: true }
    ) as ApplicationData;
    updateApplicationStep5(currentApplicationData);
  };

  const handleSave = (): void => {
    void onSave(application);
  };
  const handleDelete = (): void => {
    void onDelete(application.id ?? '');
  };

  const handleSubmit = (): void => {
    const submitFields = isSubmit
      ? {
          status:
            application.status === APPLICATION_STATUSES.DRAFT
              ? APPLICATION_STATUSES.RECEIVED
              : APPLICATION_STATUSES.HANDLING,
        }
      : { applicationStep: getApplicationStepString(6) };
    const currentApplicationData = snakecaseKeys(
      {
        ...application,
        ...submitFields,
        calculation: application.calculation
          ? {
              ...application.calculation,
              monthlyPay: stringToFloatValue(
                application.calculation.monthlyPay
              ),
              otherExpenses: stringToFloatValue(
                application.calculation.otherExpenses
              ),
              vacationMoney: stringToFloatValue(
                application.calculation.vacationMoney
              ),
              overrideMonthlyBenefitAmount: stringToFloatValue(
                application.calculation.overrideMonthlyBenefitAmount
              ),
            }
          : undefined,
      },
      { deep: true }
    ) as ApplicationData;
    if (isSubmit && onSubmit) {
      onSubmit();
    }
    updateApplicationStep5(currentApplicationData);
  };
  const handleClose = (): void => {
    void router.push(ROUTES.HOME);
  };

  return {
    t,
    handleSave,
    handleSubmit,
    handleBack: onBack,
    handleDelete,
    handleStepChange,
    handleClose,
    translationsBase,
    isSubmit,
  };
};

export { useApplicationFormStep5 };
