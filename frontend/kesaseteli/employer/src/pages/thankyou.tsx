import { Button, IconPlus } from 'hds-react';
import ApplicationSummary from 'kesaseteli/employer/components/application/summary/ApplicationSummary';
import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { useQueryClient } from 'react-query';
import Container from 'shared/components/container/Container';
import FormSection from 'shared/components/forms/section/FormSection';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import withAuth from 'shared/components/hocs/withAuth';
import { $Notification } from 'shared/components/notification/Notification.sc';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import useGoToPage from 'shared/hooks/useGoToPage';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';
import { convertToUIDateAndTimeFormat } from 'shared/utils/date.utils';

const ThankYouPage: NextPage = () => {
  const { t } = useTranslation();
  const { applicationQuery, applicationId } = useApplicationApi();
  const queryClient = useQueryClient();
  const goToPage = useGoToPage();

  const createNewApplicationClick = React.useCallback((): void => {
    queryClient.clear();
    void goToPage('/');
  }, [queryClient, goToPage]);

  if (!applicationId) {
    void goToPage('/');
    return null;
  }

  if (applicationQuery.isSuccess) {
    const application = applicationQuery.data;
    if (application.status === 'draft') {
      void goToPage(`/application?id=${applicationId}`, {
        operation: 'replace',
      });
    }
    return (
      <Container>
        <Head>
          <title>
            {t(`common:thankyouPage.thankyouMessageLabel`)} |{' '}
            {t(`common:appName`)}
          </title>
        </Head>
        <$Notification
          label={t(`common:thankyouPage.thankyouMessageLabel`)}
          type="success"
          size="large"
        >
          {t(`common:thankyouPage.thankyouMessageContent`)}
        </$Notification>
        <ApplicationSummary
          header={t(`common:thankyouPage.title`, {
            submitted_at: convertToUIDateAndTimeFormat(
              application.submitted_at
            ),
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
      </Container>
    );
  }
  return <PageLoadingSpinner />;
};

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default withAuth(ThankYouPage);
