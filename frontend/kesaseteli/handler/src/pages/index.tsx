import HandlerForm from 'kesaseteli/handler/components/form/HandlerForm';
import useYouthApplicationQuery from 'kesaseteli/handler/hooks/backend/useYouthApplicationQuery';
import { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import React from 'react';
import Container from 'shared/components/container/Container';
import FormSection from 'shared/components/forms/section/FormSection';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import FormSectionHeading from 'shared/components/forms/section/FormSectionHeading';
import { $Notification } from 'shared/components/notification/Notification.sc';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import useRouterQueryParam from 'shared/hooks/useRouterQueryParam';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';

const handlerIndex: NextPage = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { t } = useTranslation();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { value: applicationId, isRouterLoading } = useRouterQueryParam('id');

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const youthApplicationQuery = useYouthApplicationQuery(applicationId);
  const notFound = youthApplicationQuery.isError || !applicationId;
  // eslint-disable-next-line react-hooks/rules-of-hooks

  if (isRouterLoading || youthApplicationQuery.isLoading) {
    return <PageLoadingSpinner />;
  }
  return (
    <Container>
      <Head>
        <title>{t(`common:appName`)}</title>
      </Head>
      <FormSection columns={2} withoutDivider data-testid="handler-form">
        <FormSectionHeading
          $colSpan={2}
          size="s"
          header={t('common:handlerApplication.title')}
          as="h3"
        />
        {youthApplicationQuery.isSuccess && (
          <HandlerForm application={youthApplicationQuery.data} />
        )}
        {notFound && (
          <$GridCell>
            <$Notification
              label={t('common:handlerApplication.notFound')}
              type="alert"
            />
          </$GridCell>
        )}
      </FormSection>
    </Container>
  );
};

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default handlerIndex;
