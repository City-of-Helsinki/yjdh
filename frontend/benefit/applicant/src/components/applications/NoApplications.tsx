import { $NoApplicationsContainer } from 'benefit/applicant/components/applications/Applications.sc';
import { ROUTES } from 'benefit/applicant/constants';
import { Button, IconDocument, IconPlus } from 'hds-react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import React from 'react';

const NoApplications = (): JSX.Element => {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <$NoApplicationsContainer>
      <IconDocument size="xl" />
      <h2>{t('common:applications.list.noApplications')}</h2>
      <Button
        onClick={() => router.push(ROUTES.APPLICATION_FORM)}
        iconLeft={<IconPlus />}
        theme="coat"
      >
        {t('common:mainIngress.frontPage.newApplicationBtnText')}
      </Button>
    </$NoApplicationsContainer>
  );
};

export default NoApplications;
