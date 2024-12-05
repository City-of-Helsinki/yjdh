import { AxiosError } from 'axios';
import { $PageHeading } from 'benefit/handler/components/alterationHandling/AlterationHandling.sc';
import AlterationHandlingForm from 'benefit/handler/components/alterationHandling/AlterationHandlingForm';
import useAlterationHandling from 'benefit/handler/components/alterationHandling/useAlterationHandling';
import ApplicationHeader from 'benefit/handler/components/applicationHeader/ApplicationHeader';
import { ROUTES } from 'benefit/handler/constants';
import { ALTERATION_STATE } from 'benefit-shared/constants';
import camelcaseKeys from 'camelcase-keys';
import { Button, IconArrowLeft } from 'hds-react';
import kebabCase from 'lodash/kebabCase';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import React from 'react';
import LoadingSkeleton from 'react-loading-skeleton';
import Container from 'shared/components/container/Container';
import hdsToast from 'shared/components/toast/Toast';
import { useTheme } from 'styled-components';

const AlterationHandling = (): JSX.Element => {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();

  const { application, alteration, isLoading } = useAlterationHandling();

  const translationBase = 'common:applications.alterations.handling';

  const onSuccess = (isRecoverable: boolean): void => {
    const notificationTranslationBase = `common:notifications.alterationHandled.${
      isRecoverable ? 'recoverable' : 'nonrecoverable'
    }`;
    hdsToast({
      autoDismissTime: 0,
      type: 'success',
      labelText: t(`${notificationTranslationBase}.label`),
      text: t(`${notificationTranslationBase}.message`, {
        applicationNumber: application.applicationNumber,
      }),
    });
    return void router.push(`${ROUTES.APPLICATION}?id=${application.id}`);
  };

  const onError = (error: AxiosError<unknown>): void => {
    const errorData = camelcaseKeys(error.response?.data ?? {});
    const errors = [];

    const getErrorItem = (
      fieldKey: string,
      itemKey: string,
      value: string
    ): JSX.Element => {
      const fieldLabel = t(`${translationBase}.fields.${fieldKey}.label`, '');

      if (!fieldLabel) {
        return <li key={`${itemKey}`}>{value}</li>;
      }

      return (
        <li key={`${itemKey}`}>
          <a href={`#${kebabCase(fieldKey)}`}>
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

  if (isLoading) {
    return (
      <>
        <LoadingSkeleton
          width="100%"
          height={96}
          baseColor={theme.colors.coatOfArms}
          highlightColor={theme.colors.fogDark}
          borderRadius={0}
        />

        <Container>
          <LoadingSkeleton
            height={120}
            css={{ marginBottom: theme.spacing.m }}
          />
          <LoadingSkeleton
            height={120}
            css={{ marginBottom: theme.spacing.m }}
          />
          <LoadingSkeleton
            height={120}
            css={{ marginBottom: theme.spacing.m }}
          />
          <LoadingSkeleton
            height={120}
            css={{ marginBottom: theme.spacing.m }}
          />
          <LoadingSkeleton
            height={120}
            css={{ marginBottom: theme.spacing.m }}
          />
        </Container>
      </>
    );
  }

  const applicationFound = !!application?.id;
  const alterationFound = !!alteration?.id;
  const alterationCanBeHandled =
    alterationFound &&
    [ALTERATION_STATE.RECEIVED || ALTERATION_STATE.OPENED].includes(
      alteration.state
    );

  return (
    <div>
      <ApplicationHeader
        data={application}
        isApplicationReadOnly={false}
        data-testid="application-header"
      />
      {alterationCanBeHandled ? (
        <AlterationHandlingForm
          application={application}
          alteration={alteration}
          onError={onError}
          onSuccess={onSuccess}
        />
      ) : (
        <Container>
          <$PageHeading>
            {t(`${translationBase}.headings.pageHeading`)}
          </$PageHeading>
          {alterationFound ? (
            <p>{t(`${translationBase}.error.alreadyHandled`)}</p>
          ) : (
            <p>{t(`${translationBase}.error.alterationNotFound`)}</p>
          )}
          <Button
            theme="coat"
            onClick={() =>
              router.push(
                applicationFound
                  ? `${ROUTES.APPLICATION}/?id=${application.id}`
                  : `${ROUTES.ALTERATIONS}`
              )
            }
            iconLeft={<IconArrowLeft />}
          >
            {applicationFound
              ? t(`${translationBase}.actions.returnToApplication`)
              : t(`${translationBase}.actions.returnToAlterationList`)}
          </Button>
        </Container>
      )}
    </div>
  );
};

export default AlterationHandling;
