import { AxiosError } from 'axios';
import {
  $AlterationFormButtonContainer,
  $AlterationFormContainer,
} from 'benefit/applicant/components/applications/alteration/AlterationPage.sc';
import useAlterationForm from 'benefit/applicant/components/applications/alteration/useAlterationForm';
import { useTranslation } from 'benefit/applicant/i18n';
import AlterationForm from 'benefit-shared/components/alterationForm/AlterationForm';
import { $SaveActionFormErrorText } from 'benefit-shared/components/alterationForm/AlterationForm.sc';
import { ALTERATION_TYPE } from 'benefit-shared/constants';
import AlterationFormProvider from 'benefit-shared/context/AlterationFormProvider';
import {
  Application,
  ApplicationAlterationData,
} from 'benefit-shared/types/application';
import camelcaseKeys from 'camelcase-keys';
import { Button, IconAlertCircleFill, IconArrowRight } from 'hds-react';
import kebabCase from 'lodash/kebabCase';
import React from 'react';
import { useQueryClient } from 'react-query';
import { $Hr } from 'shared/components/forms/section/FormSection.sc';
import hdsToast from 'shared/components/toast/Toast';

type Props = {
  onCancel: () => void;
  onSuccess: () => void;
  application: Application;
};

const AlterationFormContainer: React.FC<Props> = ({
  onCancel,
  onSuccess,
  application,
}) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const handleSuccess = async (
    response: ApplicationAlterationData
  ): Promise<void> => {
    await queryClient.invalidateQueries(['applications', application.id]);
    onSuccess();

    const textKey =
      response.alteration_type === ALTERATION_TYPE.TERMINATION
        ? 'common:notifications.alterationCreated.bodyTermination'
        : 'common:notifications.alterationCreated.bodySuspension';

    hdsToast({
      autoDismissTime: 0,
      type: 'success',
      labelText: t('common:notifications.alterationCreated.title'),
      text: t(textKey, {
        id: application.applicationNumber,
      }),
    });
  };

  const handleError = (error: AxiosError<unknown>): void => {
    const errorData = camelcaseKeys(error.response?.data ?? {});
    const errors = [];

    const getErrorItem = (
      fieldKey: string,
      itemKey: string,
      value: string
    ): JSX.Element => {
      const fieldLabel = t(
        `common:applications.alterations.new.fields.${fieldKey}.label`,
        ''
      );

      if (!fieldLabel) {
        return <li key={`${itemKey}`}>{value}</li>;
      }

      return (
        <li key={`${itemKey}`}>
          <a href={`#alteration-${kebabCase(fieldKey)}`}>
            {fieldLabel}: {value}
          </a>
        </li>
      );
    };

    Object.entries(errorData).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((item: string) =>
          errors.push(getErrorItem(key, `${key}_${item}`, item))
        );
      } else {
        errors.push(getErrorItem(key, key, value as string));
      }
    });

    hdsToast({
      autoDismissTime: 0,
      type: 'error',
      labelText: t('common:error.generic.label'),
      text: errors,
    });
  };

  const alterationFormContextValues = useAlterationForm({
    application,
    onSuccess: handleSuccess,
    onError: handleError,
  });

  const { handleSubmit, isSubmitting, isSubmitted, formik } =
    alterationFormContextValues;

  return (
    <$AlterationFormContainer>
      <AlterationFormProvider {...alterationFormContextValues}>
        <AlterationForm application={application} />
      </AlterationFormProvider>
      <$Hr />
      <$AlterationFormButtonContainer>
        <Button theme="black" variant="secondary" onClick={onCancel}>
          {t(`common:applications.alterations.new.actions.cancel`)}
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || (isSubmitted && !formik.isValid)}
          theme="coat"
          iconRight={<IconArrowRight />}
          isLoading={isSubmitting}
          loadingText={t(`common:utility.submitting`)}
        >
          {t(`common:applications.alterations.new.actions.submit`)}
        </Button>
      </$AlterationFormButtonContainer>
      {isSubmitted && !formik.isValid && (
        <$SaveActionFormErrorText>
          <IconAlertCircleFill />
          <p aria-live="polite">
            {t('common:applications.errors.dirtyOrInvalidForm')}
          </p>
        </$SaveActionFormErrorText>
      )}
    </$AlterationFormContainer>
  );
};

export default AlterationFormContainer;
