import YouthForm from 'kesaseteli/youth/components/youth-form/YouthForm';
import YouthFormData from 'kesaseteli-shared/types/youth-form-data';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import Container from 'shared/components/container/Container';
import Heading from 'shared/components/forms/heading/Heading';

const YouthApplication: React.FC = () => {
  const { t } = useTranslation();

  const methods = useForm<YouthFormData>({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    criteriaMode: 'all',
  });

  return (
    <Container>
      <Head>
        <title>{t(`common:appName`)}</title>
      </Head>
      <Heading size="l" header={t('common:youthApplication.title')} as="h2" />
      <p>{t('common:youthApplication.paragraph_1')}</p>
      <FormProvider {...methods}>
        <YouthForm />
      </FormProvider>
    </Container>
  );
};

export default YouthApplication;
