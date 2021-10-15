import { Button, IconPlus } from 'hds-react';
import ApplicationForm from 'kesaseteli/employer/components/application/ApplicationForm';
import ApplicationSummary from 'kesaseteli/employer/components/application/summary/ApplicationSummary';
import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import { GetStaticProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import React from 'react';
import Container from 'shared/components/container/Container';
import FormSection from 'shared/components/forms/section/FormSection';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import withAuth from 'shared/components/hocs/withAuth';
import Layout from 'shared/components/Layout';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import useLocale from 'shared/hooks/useLocale';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';
import { convertToUIDateAndTimeFormat } from 'shared/utils/date.utils';

import { $Notification } from '../components/application/login.sc';

const ThankYouPage: NextPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const locale = useLocale();
  const { application, applicationId, isLoading } = useApplicationApi();

  const createNewApplicationClick = React.useCallback((): void => {
    void router.push(`${locale}/`);
  }, [router, locale]);

  if (isLoading) {
    return <PageLoadingSpinner />;
  }

  if (!application) {
    void router.push(`${locale}/`);
    return <PageLoadingSpinner />;
  }

  if (applicationId && application.status === 'draft') {
    void router.push(`${locale}/application?id=${applicationId}`);
    return <PageLoadingSpinner />;
  }

  const { submitted_at } = application;

  return (
    <Container>
      <Layout>
        <$Notification
          label={t(`common:thankyouPage.thankyouMessageLabel`)}
          type="success"
          size="large"
        >
          {t(`common:thankyouPage.thankyouMessageContent`)}
        </$Notification>
        <ApplicationForm>
          <ApplicationSummary
            header={t(`common:thankyouPage.title`, {
              submitted_at: convertToUIDateAndTimeFormat(submitted_at),
            })}
          />
          <FormSection columns={1} withoutDivider>
            <$GridCell>
              <Button
                theme="coat"
                iconLeft={<IconPlus />}
                onClick={createNewApplicationClick}
              >
                {t(`common:thankyouPage.createNewApplication`)}
              </Button>
            </$GridCell>
          </FormSection>
        </ApplicationForm>
      </Layout>
    </Container>
  );
};

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default withAuth(ThankYouPage);
