'use client';

import YouthForm from 'kesaseteli/youth/components/youth-form/YouthForm';
import YouthFormData from 'kesaseteli-shared/types/youth-form-data';
import React from 'react';
import { FormProvider, useForm, UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Container from 'shared/components/container/Container';
import Heading from 'shared/components/forms/heading/Heading';

const YouthApplication: React.FC = () => {
  const { t } = useTranslation();

  const methods: UseFormReturn<YouthFormData> = useForm<YouthFormData>({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    criteriaMode: 'all',
  });

  return (
    <Container>
      <Heading size="l" header={t('common:youthApplication.title')} as="h2" />
      <p>{t('common:youthApplication.paragraph_1')}</p>
      <FormProvider {...methods}>
        <YouthForm />
      </FormProvider>
    </Container>
  );
};

export default YouthApplication;
