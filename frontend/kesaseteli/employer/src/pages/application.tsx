import CompanyInfo from 'kesaseteli/employer/components/companyInfo/CompanyInfo';
import InvoicerForm from 'kesaseteli/employer/components/invoicerForm/InvoicerForm';
import { GetStaticProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import FormSection from 'shared/components/forms/section/FormSection';
import withAuth from 'shared/components/hocs/withAuth';
import Layout from 'shared/components/Layout';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';
import { DEFAULT_LANGUAGE } from 'shared/i18n/i18n';
import { getFirstValue } from 'shared/utils/array.utils';

const ApplicationPage: NextPage = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const locale = router.locale ?? DEFAULT_LANGUAGE;

  const applicationId = getFirstValue(router.query.id);

  if (!applicationId) {
    void router.push(`${locale}/`);
    return null;
  }

  return (
    <Layout headingText={t('common:application.step1.header')}>
      <FormSection>
        <CompanyInfo applicationId={applicationId} />
        <InvoicerForm applicationId={applicationId} />
      </FormSection>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = getServerSideTranslations(
  'common'
);

export default withAuth(ApplicationPage);
