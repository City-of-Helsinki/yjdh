import { $PageHeading } from 'benefit/applicant/components/applications/Applications.sc';
import useUserQuery from 'benefit/applicant/hooks/useUserQuery';
import camelcaseKeys from 'camelcase-keys';
import { Button, Logo, LogoLanguage } from 'hds-react';
import { GetStaticProps, NextPage } from 'next';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Container from 'shared/components/container/Container';
import FormSection from 'shared/components/forms/section/FormSection';
import { $GridCell, $Hr } from 'shared/components/forms/section/FormSection.sc';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';
import { capitalize } from 'shared/utils/string.utils';
import { useTheme } from 'styled-components';

import PdfViewer from '../components/pdfViewer/PdfViewer';
import useApproveTermsOfServiceMutation from '../hooks/useApproveTermsOfServiceMutation';
import useLocale from '../hooks/useLocale';
import useLogout from '../hooks/useLogout';
import { ApplicantConsents, TermsProp } from '../types/application';

const TermsOfService: NextPage = () => {
  const locale = useLocale();
  const textLocale = capitalize(locale);

  const theme = useTheme();

  const { t } = useTranslation();

  const userQuery = useUserQuery((data) => camelcaseKeys(data, { deep: true }));
  const { data } = userQuery;

  const termsInEffectUrl = React.useMemo(() => {
    if (
      data?.termsOfServiceInEffect &&
      data?.termsOfServiceInEffect[`termsPdf${textLocale}` as TermsProp]
    )
      return data.termsOfServiceInEffect[`termsPdf${textLocale}` as TermsProp];
    return '';
  }, [data?.termsOfServiceInEffect, textLocale]);

  const openTermsAsPDF = (): void => {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const newTab = window.open(termsInEffectUrl, '_blank');
    if (newTab) {
      newTab.focus();
    }
  };

  const { mutate: approveTermsOfService } = useApproveTermsOfServiceMutation();

  const logout = useLogout();

  return (
    <Container>
      <FormSection withoutDivider>
        <$GridCell $colSpan={3} style={{ marginTop: theme.spacingLayout.l }}>
          <Logo language={locale as LogoLanguage} size="large" />
        </$GridCell>
        <$GridCell $colStart={1} $colSpan={12}>
          <$PageHeading>{t('common:serviceName')}</$PageHeading>
        </$GridCell>
        <$GridCell $colSpan={12}>
          <h2 style={{ marginBottom: 0 }}>
            {t('common:login.termsOfServiceHeader')}
          </h2>
        </$GridCell>
        <$GridCell $colSpan={12}>
          <PdfViewer
            file={termsInEffectUrl}
            scale={1.8}
            documentMarginLeft="-70px"
          />
        </$GridCell>
        <$GridCell
          $colSpan={5}
          css={`
            margin-bottom: var(--spacing-l);
          `}
        >
          <Button theme="black" variant="secondary" onClick={openTermsAsPDF}>
            {t('common:applications.actions.openTermsAsPDF')}
          </Button>
        </$GridCell>
        <$GridCell $colSpan={12}>
          <$Hr />
        </$GridCell>
        <$GridCell $colSpan={7} style={{ display: 'flex' }}>
          <Button
            theme="coat"
            variant="primary"
            onClick={() =>
              approveTermsOfService({
                terms: data?.termsOfServiceInEffect.id ?? '',
                selected_applicant_consents: data
                  ? data.termsOfServiceInEffect.applicantConsents.map(
                      (item: ApplicantConsents) => item.id
                    )
                  : [''],
              })
            }
            style={{ marginRight: theme.spacing.s }}
          >
            {t('common:applications.actions.continueToService')}
          </Button>
          <Button theme="black" variant="secondary" onClick={logout}>
            {t('common:applications.actions.pauseAndExit')}
          </Button>
        </$GridCell>
      </FormSection>
    </Container>
  );
};

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default TermsOfService;
