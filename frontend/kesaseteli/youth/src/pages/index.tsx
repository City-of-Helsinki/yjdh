import { Button } from 'hds-react';
import Voucher from 'kesaseteli/youth/types/Voucher';
import { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import { Trans, useTranslation } from 'next-i18next';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import Container from 'shared/components/container/Container';
import Heading from 'shared/components/forms/heading/Heading';
import Checkbox from 'shared/components/forms/inputs/Checkbox';
import TextInput from 'shared/components/forms/inputs/TextInput';
import FormSection from 'shared/components/forms/section/FormSection';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { EMAIL_REGEX, POSTAL_CODE_REGEX } from 'shared/constants';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';

const YouthIndex: NextPage = () => {
  const { t } = useTranslation();

  const methods = useForm<Voucher>({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    criteriaMode: 'all',
  });

  return (
    <Container>
      <Head>
        <title>{t(`common:appName`)}</title>
      </Head>
      <Heading size="l" header={t('common:applicationPage.title')} as="h2" />
      <p>{t('common:applicationPage.paragraph_1')}</p>
      <FormProvider {...methods}>
        <form>
          <FormSection
            header={t('common:applicationPage.form.title')}
            columns={2}
          >
            <TextInput<Voucher>
              id="firstName"
              label={t('common:applicationPage.form.firstName')}
              registerOptions={{ required: true, maxLength: 256 }}
            />
            <TextInput<Voucher>
              id="lastName"
              label={t('common:applicationPage.form.lastName')}
              registerOptions={{ required: true, maxLength: 256 }}
            />
            <TextInput<Voucher>
              id="ssn"
              label={t('common:applicationPage.form.ssn')}
              registerOptions={{ required: true, maxLength: 32 }}
            />
            <TextInput<Voucher>
              id="postcode"
              label={t('common:applicationPage.form.postcode')}
              type="number"
              registerOptions={{
                required: true,
                pattern: POSTAL_CODE_REGEX,
                maxLength: 256,
              }}
            />
            <TextInput<Voucher>
              id="school"
              label={t('common:applicationPage.form.school')}
              registerOptions={{ required: true, maxLength: 256 }}
              $colSpan={2}
            />
            <TextInput<Voucher>
              id="email"
              label={t('common:applicationPage.form.email')}
              registerOptions={{
                required: true,
                maxLength: 254,
                pattern: EMAIL_REGEX,
              }}
            />
            <TextInput<Voucher>
              label={t('common:applicationPage.form.phoneNumber')}
              id="phoneNumber"
              registerOptions={{ required: true, maxLength: 64 }}
            />
            <$GridCell $colSpan={2}>
              <Checkbox<Voucher>
                id="termsAndConditions"
                registerOptions={{ required: true }}
                label={
                  <Trans
                    i18nKey="common:applicationPage.form.termsAndConditions"
                    components={{
                      a: (
                        <a
                          href={t('common:termsAndConditionsLink')}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          {}
                        </a>
                      ),
                    }}
                  >
                    {'Olen lukenut palvelun <a>käyttöehdot</a> ja hyväksyn ne.'}
                  </Trans>
                }
              />
            </$GridCell>
            <$GridCell $colSpan={2}>
              <Button theme="coat">
                {t(`common:applicationPage.form.sendButton`)}
              </Button>
            </$GridCell>
          </FormSection>
        </form>
      </FormProvider>
      <p>{t(`common:applicationPage.form.requiredInfo`)}</p>
    </Container>
  );
};

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default YouthIndex;
