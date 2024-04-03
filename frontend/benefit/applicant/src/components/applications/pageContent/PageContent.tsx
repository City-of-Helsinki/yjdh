import {
  $HeaderItem,
  $HeaderRightColumnItem,
  $PageHeader,
  $PageHeading,
  $PageHeadingApplicant,
  $PageHeadingHelperText,
  $PageSubHeading,
  $SpinnerContainer,
} from 'benefit/applicant/components/applications/Applications.sc';
import ApplicationFormStep1 from 'benefit/applicant/components/applications/forms/application/step1/ApplicationFormStep1';
import ApplicationFormStep2 from 'benefit/applicant/components/applications/forms/application/step2/ApplicationFormStep2';
import ApplicationFormStep3 from 'benefit/applicant/components/applications/forms/application/step3/ApplicationFormStep3';
import ApplicationFormStep4 from 'benefit/applicant/components/applications/forms/application/step4/ApplicationFormStep4';
import ApplicationFormStep5 from 'benefit/applicant/components/applications/forms/application/step5/ApplicationFormStep5';
import ApplicationFormStep6 from 'benefit/applicant/components/applications/forms/application/step6/ApplicationFormStep6';
import DecisionSummary from 'benefit/applicant/components/applications/pageContent/DecisionSummary';
import StatusIcon from 'benefit/applicant/components/applications/StatusIcon';
import NoCookieConsentsNotification from 'benefit/applicant/components/cookieConsent/NoCookieConsentsNotification';
import { $Hr } from 'benefit/applicant/components/pages/Pages.sc';
import { SUBMITTED_STATUSES } from 'benefit/applicant/constants';
import { useAskem } from 'benefit/applicant/hooks/useAnalytics';
import { IconInfoCircleFill, LoadingSpinner, Stepper } from 'hds-react';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import Container from 'shared/components/container/Container';
import { getFullName } from 'shared/utils/application.utils';
import { convertToUIDateAndTimeFormat } from 'shared/utils/date.utils';
import { useTheme } from 'styled-components';

import ErrorPage from '../../errorPage/ErrorPage';
import { $Notification } from '../../Notification/Notification.sc';
import NotificationView from '../../notificationView/NotificationView';
import { $AskemContainer, $AskemItem } from '../Applications.sc';
import { usePageContent } from './usePageContent';

const stepperCss = {
  'pointer-events': 'none',
  p: {
    'text-decoration': 'none !important',
  },
};

// eslint-disable-next-line sonarjs/cognitive-complexity
const PageContent: React.FC = () => {
  const {
    t,
    id,
    steps,
    currentStep,
    application,
    isError,
    isLoading,
    isReadOnly,
    isSubmittedApplication,
    setIsSubmittedApplication,
  } = usePageContent();

  const theme = useTheme();
  const router = useRouter();
  const canShowAskem = useAskem(router.locale, isSubmittedApplication);

  useEffect(() => {
    if (isReadOnly) document.title = t('common:pageTitles.viewApplication');
    else if (router.query.id)
      document.title = t('common:pageTitles.editApplication');
    else document.title = t('common:pageTitles.createApplication');
  }, [router.query.id, isReadOnly, t]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentStep]);

  if (isLoading) {
    return (
      <$SpinnerContainer>
        <LoadingSpinner />
      </$SpinnerContainer>
    );
  }

  if (isError) {
    return (
      <ErrorPage
        title={t('common:errorPage.title')}
        message={t('common:errorPage.message')}
        showActions={{ linkToRoot: true, linkToLogout: true }}
      />
    );
  }

  if (isSubmittedApplication) {
    return (
      <>
        <NotificationView
          applicationId={application.id}
          title={t('common:notifications.applicationSubmitted.label')}
          message={t('common:notifications.applicationSubmitted.message', {
            applicationNumber: application?.applicationNumber,
            applicantName: getFullName(
              application?.employee?.firstName,
              application?.employee?.lastName
            ),
          })}
        />
        {router.locale === 'fi' && (
          <Container>
            <$Hr />
            {canShowAskem ? (
              <$AskemContainer>
                <$AskemItem />
                <$AskemItem>
                  <div className="rns" />
                </$AskemItem>
              </$AskemContainer>
            ) : (
              <NoCookieConsentsNotification
                submittedApplication={application.id}
              />
            )}
            <$Hr />
          </Container>
        )}
      </>
    );
  }

  // if view mode, show customized summary
  if (
    application.status &&
    SUBMITTED_STATUSES.includes(application.status) &&
    isReadOnly
  ) {
    return (
      <Container>
        <$PageHeader>
          <$HeaderItem>
            <$PageHeading>
              {t('common:applications.pageHeaders.edit')}
            </$PageHeading>
            <$PageHeadingApplicant>
              {application.employee.firstName} {application.employee.lastName}
            </$PageHeadingApplicant>
          </$HeaderItem>
          {id && application?.submittedAt && application?.applicationNumber && (
            <$HeaderRightColumnItem>
              <div>
                <StatusIcon status={application.status} />
                {t(`common:applications.statuses.${application.status}`)}
              </div>
              <$PageSubHeading
                css={`
                  font-weight: 400;
                  font-size: ${theme.fontSize.body.m};
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
          )}
        </$PageHeader>
        <DecisionSummary application={application} />
        <ApplicationFormStep5 isReadOnly data={application} />
      </Container>
    );
  }

  // if trying to access edit mode, but the status is not correct
  // the exception case is only when the application was just submitted so we show success view inside 5th and 6th step
  if (
    application.status &&
    SUBMITTED_STATUSES.includes(application.status) &&
    !isSubmittedApplication
  ) {
    return (
      <Container>
        <ErrorPage
          title={t('common:errorPage.title')}
          message={t('common:errorPage.message')}
          showActions={{ linkToRoot: true, linkToLogout: true }}
        />
      </Container>
    );
  }

  return (
    <Container
      data-testid={`step-${currentStep}`}
      css={{
        'max-width': theme.contentWidth.max,
        margin: '0 auto',
        'grid-template-columns': 'repeat(auto-fit, minmax(180px, 1fr))',
      }}
    >
      <$PageHeader>
        <$HeaderItem>
          <$PageHeading>
            {t(`common:applications.pageHeaders.${id ? 'edit' : 'new'}`)}
          </$PageHeading>
        </$HeaderItem>
        <$HeaderItem>
          <Stepper
            steps={steps}
            selectedStep={currentStep - 1}
            onStepClick={(e) => e.stopPropagation()}
            css={stepperCss}
            theme={theme.components.stepper}
          />
        </$HeaderItem>
      </$PageHeader>
      {id && application?.createdAt && !isSubmittedApplication && (
        <>
          <$PageSubHeading>
            {`${t(
              'common:applications.pageHeaders.saved'
            )} ${convertToUIDateAndTimeFormat(application?.modifiedAt)}`}
          </$PageSubHeading>
          {(currentStep === 1 || currentStep === 2) && (
            <$PageHeadingHelperText>
              <div style={{ maxWidth: '360px' }}>
                <$Notification>
                  <span>
                    <IconInfoCircleFill color="var(--color-coat-of-arms)" />
                  </span>
                  {t('common:applications.pageHeaders.guideText')}
                </$Notification>
              </div>
            </$PageHeadingHelperText>
          )}
          {currentStep === 5 && (
            <$PageHeadingHelperText>
              {t('common:applications.pageHeaders.helperText')}
            </$PageHeadingHelperText>
          )}
        </>
      )}
      {currentStep === 1 && <ApplicationFormStep1 data={application} />}
      {currentStep === 2 && <ApplicationFormStep2 data={application} />}
      {currentStep === 3 && <ApplicationFormStep3 data={application} />}
      {currentStep === 4 && <ApplicationFormStep4 data={application} />}
      {currentStep === 5 && (
        <ApplicationFormStep5
          setIsSubmittedApplication={setIsSubmittedApplication}
          data={application}
        />
      )}
      {currentStep === 6 && (
        <ApplicationFormStep6
          setIsSubmittedApplication={setIsSubmittedApplication}
          data={application}
        />
      )}
    </Container>
  );
};

export default PageContent;
