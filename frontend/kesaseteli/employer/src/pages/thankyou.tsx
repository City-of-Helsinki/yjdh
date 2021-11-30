import { Button, IconPlus } from 'hds-react';
import ApplicationSummary from 'kesaseteli/employer/components/application/summary/ApplicationSummary';
import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { useQueryClient } from 'react-query';
import Container from 'shared/components/container/Container';
import FormSection from 'shared/components/forms/section/FormSection';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import withAuth from 'shared/components/hocs/withAuth';
import Notification from 'shared/components/notification/Notification';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import useLocale from 'shared/hooks/useLocale';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';
import { convertToUIDateAndTimeFormat } from 'shared/utils/date.utils';

const ThankYouPage: NextPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const locale = useLocale();
  const { applicationQuery, applicationId } = useApplicationApi();
  const queryClient = useQueryClient();

  const createNewApplicationClick = React.useCallback((): void => {
    queryClient.clear();
    void router.push(`${locale}/`);
  }, [queryClient, router, locale]);

  if (!applicationId) {
    void router.push(`${locale}/`);
    return <PageLoadingSpinner />;
  }

  if (applicationQuery.isSuccess) {
    const application = applicationQuery.data;
    if (application.status === 'draft') {
      void router.replace(`${locale}/application?id=${applicationId}`);
      return <PageLoadingSpinner />;
    }
    return (
      <Container>
        <Head>
          <title>
            {t(`common:thankyouPage.thankyouMessageLabel`)} |{' '}
            {t(`common:appName`)}
          </title>
        </Head>
        <Notification
          label={t(`common:thankyouPage.thankyouMessageLabel`)}
          type="success"
          size="large"
        >
          {t(`common:thankyouPage.thankyouMessageContent`)}
        </Notification>
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
