import { AxiosError } from 'axios';
import {
  $AlterationFormStickyBarContainer,
  $GuideParagraphFirst,
  $GuideParagraphSecond,
} from 'benefit/handler/components/alteration/NewAlteration.sc';
import useAlterationForm from 'benefit/handler/components/alteration/useAlterationForm';
import { $Heading } from 'benefit/handler/components/alterationList/AlterationList.sc';
import AlterationForm from 'benefit-shared/components/alterationForm/AlterationForm';
import { $SaveActionFormErrorText } from 'benefit-shared/components/alterationForm/AlterationForm.sc';
import { ALTERATION_TYPE } from 'benefit-shared/constants';
import AlterationFormProvider from 'benefit-shared/context/AlterationFormProvider';
import {
  Application,
  ApplicationAlterationData,
} from 'benefit-shared/types/application';
import camelcaseKeys from 'camelcase-keys';
import { Button, IconAlertCircleFill } from 'hds-react';
import kebabCase from 'lodash/kebabCase';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { useQueryClient } from 'react-query';
import Container from 'shared/components/container/Container';
import {
  $Grid,
  $GridCell,
} from 'shared/components/forms/section/FormSection.sc';
import StickyActionBar from 'shared/components/stickyActionBar/StickyActionBar';
import { $StickyBarSpacing } from 'shared/components/stickyActionBar/StickyActionBar.sc';
import hdsToast from 'shared/components/toast/Toast';
import { formatDate } from 'shared/utils/date.utils';

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
        startDate: formatDate(new Date(response.end_date)),
        endDate: response.resume_date
          ? formatDate(new Date(response.resume_date))
          : '-',
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

  const { handleSubmit, isSubmitted, isSubmitting, formik } =
    alterationFormContextValues;

  return (
    <AlterationFormProvider {...alterationFormContextValues}>
      <Container>
        <$Heading>{t('common:applications.alterations.new.title')}</$Heading>
        <$Grid>
          <$GridCell $colSpan={8}>
            <$GuideParagraphFirst>
              {t('common:applications.alterations.new.explanation')}
            </$GuideParagraphFirst>
            <$GuideParagraphSecond>
              {t('common:applications.pageHeaders.guideText')}
            </$GuideParagraphSecond>
          </$GridCell>
        </$Grid>
        <AlterationForm application={application} />
        <$StickyBarSpacing />
      </Container>
      <StickyActionBar>
        <$AlterationFormStickyBarContainer>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || (isSubmitted && !formik.isValid)}
            theme="coat"
            isLoading={isSubmitting}
            loadingText={t(`common:utility.submitting`)}
          >
            {t(`common:applications.alterations.new.actions.submit`)}
          </Button>
          <Button theme="black" variant="secondary" onClick={onCancel}>
            {t(`common:applications.alterations.new.actions.cancel`)}
          </Button>
          {isSubmitted && !formik.isValid && (
            <$SaveActionFormErrorText>
              <IconAlertCircleFill />
              <p aria-live="polite">
                {t(
                  'common:applications.alterations.new.error.dirtyOrInvalidForm'
                )}
              </p>
            </$SaveActionFormErrorText>
          )}
        </$AlterationFormStickyBarContainer>
      </StickyActionBar>
    </AlterationFormProvider>
  );
};

export default AlterationFormContainer;
