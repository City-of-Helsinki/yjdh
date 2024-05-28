import { AxiosError } from 'axios';
import { getValidationSchema } from 'benefit/handler/components/alterationHandling/utils/validation';
import useUpdateApplicationAlterationQuery from 'benefit/handler/hooks/useUpdateApplicationAlterationQuery';
import { ALTERATION_STATE } from 'benefit-shared/constants';
import {
  Application,
  ApplicationAlteration,
} from 'benefit-shared/types/application';
import { add, sub } from 'date-fns';
import { FormikProps, useFormik } from 'formik';
import { TFunction, useTranslation } from 'next-i18next';
import { useState } from 'react';
import {
  convertToBackendDateFormat,
  convertToUIDateFormat,
  parseDate,
} from 'shared/utils/date.utils';
import { stringToFloatValue } from 'shared/utils/string.utils';

type Props = {
  application: Application;
  alteration: ApplicationAlteration;
  onError: (error: AxiosError<unknown>) => void;
  onSuccess: () => void;
};

type AlterationHandlingProps = {
  isSubmitted: boolean;
  isSubmitting: boolean;
  t: TFunction;
  formik: FormikProps<Partial<ApplicationAlteration>>;
  handleAlteration: () => void;
};

const useAlterationHandling = ({
  application,
  alteration,
  onError,
  onSuccess,
}: Props): AlterationHandlingProps => {
  const { t } = useTranslation();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { mutate: updateAlteration, status: updateStatus } =
    useUpdateApplicationAlterationQuery();

  const submitForm = (data: Partial<ApplicationAlteration>): void => {
    updateAlteration(
      {
        id: alteration.id,
        applicationId: application.id,
        data: {
          application: application.id,
          recovery_start_date: convertToBackendDateFormat(
            data.recoveryStartDate
          ),
          recovery_end_date: convertToBackendDateFormat(data.recoveryEndDate),
          recovery_amount: data.isRecoverable
            ? String(stringToFloatValue(data.recoveryAmount))
            : '0',
          recovery_justification: data.recoveryJustification,
          is_recoverable: data.isRecoverable,
          state: ALTERATION_STATE.HANDLED,
        },
      },
      {
        onSuccess,
        onError,
      }
    );
  };

  const startDate = add(parseDate(alteration.endDate), { days: 1 });
  const endDate = alteration.resumeDate
    ? sub(parseDate(alteration.resumeDate), { days: 1 })
    : parseDate(application.endDate);

  const formik = useFormik<Partial<ApplicationAlteration>>({
    initialValues: {
      application: application.id,
      recoveryStartDate: convertToUIDateFormat(startDate),
      recoveryEndDate: convertToUIDateFormat(endDate),
      recoveryAmount: '0',
      isRecoverable: true,
      recoveryJustification: '',
    },
    onSubmit: submitForm,
    validationSchema: getValidationSchema(application, alteration, t),
  });

  const handleSubmit = (): void => {
    setIsSubmitted(true);
    void formik.validateForm().then((errors) => {
      const invalidFields = Object.keys(errors);
      if (invalidFields.length === 0) {
        void formik.submitForm();
      }

      return null;
    });
  };

  return {
    isSubmitted,
    isSubmitting: updateStatus === 'loading',
    t,
    formik,
    handleAlteration: handleSubmit,
  };
};

export default useAlterationHandling;
