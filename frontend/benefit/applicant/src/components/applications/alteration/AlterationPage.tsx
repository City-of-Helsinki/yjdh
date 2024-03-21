import { AxiosError } from 'axios';
import {
  $BackButtonContainer,
  $MainHeaderItem,
  $PageHeader,
  $PageHeading,
} from 'benefit/applicant/components/applications/alteration/AlterationPage.sc';
import useAlterationPage from 'benefit/applicant/components/applications/alteration/useAlterationPage';
import {
  $HeaderItem,
  $HeaderRightColumnItem,
  $PageHeadingApplicant,
  $PageSubHeading,
  $SpinnerContainer,
} from 'benefit/applicant/components/applications/Applications.sc';
import AlterationForm from 'benefit/applicant/components/applications/forms/application/alteration/AlterationForm';
import ErrorPage from 'benefit/applicant/components/errorPage/ErrorPage';
import { ROUTES } from 'benefit/applicant/constants';
import {
  ALTERATION_STATE,
  ALTERATION_TYPE,
  APPLICATION_STATUSES,
} from 'benefit-shared/constants';
import { ApplicationAlterationData } from 'benefit-shared/types/application';
import { isTruthy } from 'benefit-shared/utils/common';
import camelcaseKeys from 'camelcase-keys';
import { Button, IconArrowLeft, LoadingSpinner } from 'hds-react';
import kebabCase from 'lodash/kebabCase';
import { useRouter } from 'next/router';
import React from 'react';
import Container from 'shared/components/container/Container';
import hdsToast from 'shared/components/toast/Toast';
import { convertToUIDateAndTimeFormat } from 'shared/utils/date.utils';
import { useTheme } from 'styled-components';

const AlterationPage = (): JSX.Element => {
  const { t, id, application, isError, isLoading } = useAlterationPage();

  const router = useRouter();
  const theme = useTheme();

  if (isLoading) {
    return (
      <$SpinnerContainer>
        <LoadingSpinner />
      </$SpinnerContainer>
    );
  }

  if (
    !isTruthy(process.env.NEXT_PUBLIC_ENABLE_ALTERATION_FEATURES) ||
    isError ||
    !id
  ) {
    return (
      <ErrorPage
        title={t('common:errorPage.title')}
        message={t('common:errorPage.message')}
        showActions={{ linkToRoot: true, linkToLogout: true }}
      />
    );
  }

  const returnToApplication = (): void =>
    void router.push(`${ROUTES.APPLICATION_FORM}?id=${id}`);

  const onSuccess = async (
    response: ApplicationAlterationData
  ): Promise<void> => {
    returnToApplication();

    const textKey =
      response.alteration_type === ALTERATION_TYPE.TERMINATION
        ? 'common:applications.alteration.successToast.bodyTermination'
        : 'common:applications.alteration.successToast.bodySuspension';

    hdsToast({
      autoDismissTime: 0,
      type: 'success',
      labelText: t('common:applications.alteration.successToast.title'),
      text: t(textKey, {
        id: application.ahjoCaseId,
      }),
    });
  };

  const onError = (error: AxiosError<unknown>): void => {
    const errorData = camelcaseKeys(error.response?.data ?? {});
    const errors = [];

    const getErrorItem = (
      fieldKey: string,
      itemKey: string,
      value: string
    ): JSX.Element => {
      const fieldLabel = t(
        `common:applications.alteration.fields.${fieldKey}.label`,
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

  const hasHandledTermination = application.alterations.some(
    (alteration) =>
      alteration.state === ALTERATION_STATE.HANDLED &&
      alteration.alterationType === ALTERATION_TYPE.TERMINATION
  );

  const isAccepted = application.status === APPLICATION_STATUSES.ACCEPTED;

  return (
    <Container>
      <$BackButtonContainer>
        <Button
          theme="black"
          variant="supplementary"
          iconLeft={<IconArrowLeft />}
          onClick={returnToApplication}
          size="small"
        >
          {t(`common:applications.actions.back`)}
        </Button>
      </$BackButtonContainer>
      <$PageHeader>
        <$MainHeaderItem>
          <$PageHeading>
            {t(`common:applications.alteration.title`)}
          </$PageHeading>
        </$MainHeaderItem>
        <$HeaderItem>
          <$PageHeadingApplicant>
            {application.employee.firstName} {application.employee.lastName}
          </$PageHeadingApplicant>
        </$HeaderItem>
        <$HeaderRightColumnItem>
          <$PageSubHeading
            css={`
              font-weight: 400;
              font-size: ${theme.fontSize.body.m};
              margin-top: 0;
            `}
          >
            {t('common:applications.pageHeaders.sent', {
              applicationNumber: application.applicationNumber,
              submittedAt: convertToUIDateAndTimeFormat(
                application?.submittedAt
              ),
            })}
          </$PageSubHeading>
        </$HeaderRightColumnItem>
      </$PageHeader>
      {!hasHandledTermination && isAccepted && (
        <>
          <p>{t('common:applications.pageHeaders.guideText')}</p>
          <p>{t('common:applications.alteration.explanation')}</p>
          <AlterationForm
            application={application}
            onCancel={returnToApplication}
            onSuccess={onSuccess}
            onError={onError}
          />
        </>
      )}
      {hasHandledTermination && (
        <p>{t('common:applications.alteration.error.alreadyTerminated')}</p>
      )}
      {!isAccepted && (
        <p>{t('common:applications.alteration.error.notYetAccepted')}</p>
      )}
    </Container>
  );
};

export default AlterationPage;
