import AlterationFormContainer from 'benefit/applicant/components/applications/alteration/AlterationFormContainer';
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
import ErrorPage from 'benefit/applicant/components/errorPage/ErrorPage';
import { ROUTES } from 'benefit/applicant/constants';
import {
  ALTERATION_STATE,
  ALTERATION_TYPE,
  APPLICATION_STATUSES,
} from 'benefit-shared/constants';
import { Button, IconArrowLeft, LoadingSpinner } from 'hds-react';
import { useRouter } from 'next/router';
import React from 'react';
import Container from 'shared/components/container/Container';
import {
  $Grid,
  $GridCell,
} from 'shared/components/forms/section/FormSection.sc';
import { convertToUIDateAndTimeFormat } from 'shared/utils/date.utils';
import { useTheme } from 'styled-components';

const AlterationPage = (): JSX.Element => {
  const { t, id, application, isError, isLoading } = useAlterationPage();

  const router = useRouter();
  const theme = useTheme();

  const returnToApplication = (): void =>
    void router.push(`${ROUTES.APPLICATION_FORM}?id=${id}`);

  if (isLoading || (!isError && !application)) {
    return (
      <$SpinnerContainer>
        <LoadingSpinner />
      </$SpinnerContainer>
    );
  }

  if (isError || !id) {
    return (
      <ErrorPage
        title={t('common:errorPage.title')}
        message={t('common:errorPage.message')}
        showActions={{ linkToRoot: true, linkToLogout: true }}
      />
    );
  }

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
            {t(`common:applications.alterations.new.title`)}
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
          <$Grid>
            <$GridCell $colSpan={8}>
              <p>{t('common:applications.alterations.new.explanation')}</p>
              <p>{t('common:applications.pageHeaders.guideText')}</p>
            </$GridCell>
          </$Grid>
          <AlterationFormContainer
            onCancel={returnToApplication}
            onSuccess={returnToApplication}
            application={application}
          />
        </>
      )}
      {hasHandledTermination && (
        <p>
          {t('common:applications.alterations.new.error.alreadyTerminated')}
        </p>
      )}
      {!isAccepted && (
        <p>{t('common:applications.alterations.new.error.notYetAccepted')}</p>
      )}
    </Container>
  );
};

export default AlterationPage;
