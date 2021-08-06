import {
  $HeaderItem,
  $PageHeader,
  $PageHeading,
  $PageHeadingHelperText,
  $PageSubHeading,
} from 'benefit/applicant/components/applications/Applications.sc';
import ApplicationFormStep1 from 'benefit/applicant/components/applications/forms/application/step1/ApplicationFormStep1';
import ApplicationFormStep2 from 'benefit/applicant/components/applications/forms/application/step2/ApplicationFormStep2';
import ApplicationFormStep3 from 'benefit/applicant/components/applications/forms/application/step3/ApplicationFormStep3';
import ApplicationFormStep4 from 'benefit/applicant/components/applications/forms/application/step4/ApplicationFormStep4';
import ApplicationFormStep5 from 'benefit/applicant/components/applications/forms/application/step5/ApplicationFormStep5';
import ApplicationFormStep6 from 'benefit/applicant/components/applications/forms/application/step6/ApplicationFormStep6';
import React from 'react';
import Container from 'shared/components/container/Container';
import Stepper from 'shared/components/stepper/Stepper';
import { DATE_FORMATS, formatDate } from 'shared/utils/date.utils';

import { usePageContent } from './usePageContent';

const PageContent: React.FC = () => {
  const { t, id, steps, currentStep, application } = usePageContent();
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
      {id && application?.createdAt && (
        <>
          <$PageSubHeading>
            {`${t('common:applications.pageHeaders.created')} ${formatDate(
              new Date(application?.createdAt),
              DATE_FORMATS.DATE_AND_TIME
            )}`}
          </$PageSubHeading>
          <$PageHeadingHelperText>
            {t('common:applications.pageHeaders.helperText')}
          </$PageHeadingHelperText>
        </>
      )}
      {currentStep === 1 && <ApplicationFormStep1 data={application} />}
      {currentStep === 2 && <ApplicationFormStep2 data={application} />}
      {currentStep === 3 && <ApplicationFormStep3 />}
      {currentStep === 4 && <ApplicationFormStep4 />}
      {currentStep === 5 && <ApplicationFormStep5 />}
      {currentStep === 6 && <ApplicationFormStep6 />}
    </Container>
  );
};

export default PageContent;
