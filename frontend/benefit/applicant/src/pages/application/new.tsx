import ApplicationFormStep1 from 'benefit/applicant/components/applications/forms/application/ApplicationFomStep1';
import { GetStaticProps, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import * as React from 'react';
import { StepProps } from 'shared/components/stepper/Step';
import Stepper from 'shared/components/stepper/Stepper';

const NewApplicationIndex: NextPage = () => {
  const steps: StepProps[] = [
    { title: 'Yritys' },
    { title: 'Palkattava' },
    { title: 'Liittet' },
    { title: 'Yhteenveto' },
    { title: 'Valtakirja' },
    { title: 'Lähetä' },
  ];
  return (
    <>
      <Stepper steps={steps} activeStep={3} />
      <ApplicationFormStep1 />
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale || '', ['common'])),
  },
});

export default NewApplicationIndex;
