import CreateApplicationWithoutSsnForm from 'kesaseteli/handler/components/form/CreateApplicationWithoutSsnForm';
import type { ApplicationWithoutSsnFormData } from 'kesaseteli/handler/types/application-without-ssn-types';
import { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import Container from 'shared/components/container/Container';
import FormSection from 'shared/components/forms/section/FormSection';
import FormSectionHeading from 'shared/components/forms/section/FormSectionHeading';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';

const CreateApplicationWithoutSsn: NextPage = () => {
  const { t } = useTranslation();

  const methods = useForm<ApplicationWithoutSsnFormData>({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    criteriaMode: 'all',
  });

  return (
    <Container>
      <Head>
        <title>{t(`common:appName`)}</title>
      </Head>
      <FormProvider {...methods}>
        <FormSection
          columns={2}
          withoutDivider
          data-testid="create-application-without-ssn-form"
        >
          <FormSectionHeading
            $colSpan={2}
            size="s"
            header={t('common:applicationWithoutSsn.form.title')}
            as="h3"
          />
          <CreateApplicationWithoutSsnForm />
        </FormSection>
        <p>{t('common:applicationWithoutSsn.form.requiredInfo')}</p>
      </FormProvider>
    </Container>
  );
};

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default CreateApplicationWithoutSsn;
