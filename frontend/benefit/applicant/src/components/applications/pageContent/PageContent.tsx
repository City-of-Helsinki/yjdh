import {
  $HeaderItem,
  $PageHeader,
  $PageHeading,
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
import { SUBMITTED_STATUSES } from 'benefit/applicant/constants';
import { LoadingSpinner } from 'hds-react';
import React, { useEffect } from 'react';
import Container from 'shared/components/container/Container';
import Stepper from 'shared/components/stepper/Stepper';
import { convertToUIDateAndTimeFormat } from 'shared/utils/date.utils';
import { useTheme } from 'styled-components';

import ErrorPage from '../../errorPage/ErrorPage';
import { usePageContent } from './usePageContent';

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
    handleSubmit,
  } = usePageContent();

  const theme = useTheme();

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
        showActions
      />
    );
  }

  // if view mode, show customized summary
  if (
    application.status &&
    SUBMITTED_STATUSES.includes(application.status) &&
    Boolean(isReadOnly)
  ) {
    return (
      <Container>
        <$PageHeader>
          <$HeaderItem>
            <$PageHeading>
              {t('common:applications.pageHeaders.edit')}
            </$PageHeading>
          </$HeaderItem>
        </$PageHeader>
        {id && application?.submittedAt && application?.applicationNumber && (
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
        )}
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
          showActions
        />
      </Container>
    );
  }

  return (
    <Container>
      <$PageHeader>
        <$HeaderItem>
          <$PageHeading>
            {t(`common:applications.pageHeaders.${id ? 'edit' : 'new'}`)}
          </$PageHeading>
        </$HeaderItem>
        <$HeaderItem>
          <Stepper steps={steps} activeStep={currentStep} />
        </$HeaderItem>
      </$PageHeader>
      {id && application?.createdAt && !isSubmittedApplication && (
        <>
          <$PageSubHeading>
            {`${t(
              'common:applications.pageHeaders.created'
            )} ${convertToUIDateAndTimeFormat(application?.createdAt)}`}
          </$PageSubHeading>
          <$PageHeadingHelperText>
            {t('common:applications.pageHeaders.helperText')}
          </$PageHeadingHelperText>
        </>
      )}
      {currentStep === 1 && <ApplicationFormStep1 data={application} />}
      {currentStep === 2 && <ApplicationFormStep2 data={application} />}
      {currentStep === 3 && <ApplicationFormStep3 data={application} />}
      {currentStep === 4 && <ApplicationFormStep4 data={application} />}
      {currentStep === 5 && (
        <ApplicationFormStep5
          isSubmittedApplication={isSubmittedApplication}
          onSubmit={handleSubmit}
          data={application}
        />
      )}
      {currentStep === 6 && (
        <ApplicationFormStep6
          isSubmittedApplication={isSubmittedApplication}
          onSubmit={handleSubmit}
          data={application}
        />
      )}
    </Container>
  );
};

export default PageContent;
