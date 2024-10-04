import { Footer, IconLinkExternal, Logo, logoFiDark, logoSvDark } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';
import useLocale from 'shared/hooks/useLocale';

const FooterSection: React.FC = () => {
  const { t } = useTranslation();
  const newTabText = t('common:footer.newTab');
  const locale = useLocale();
  const logoLang = locale === 'sv' ? 'sv' : 'fi';
  const logoSrcFromLanguage = (): string => {
    if (logoLang === 'fi') return logoFiDark;
    if (logoLang === 'sv') return logoSvDark;
    if (logoLang === 'en') return logoFiDark;

    return logoFiDark;
  };

  return (
    <Footer title={t('common:appName')} theme="dark">
      <Footer.Base
        copyrightHolder={t('common:footer.copyrightText')}
        copyrightText={t('common:footer.allRightsReservedText')}
        backToTopLabel={t('common:footer.backToTop')}
        logo={<Logo src={logoSrcFromLanguage()} size="medium" alt={t('common:helsinkiLogo')} />}
      >
        <Footer.Link
          as="a"
          href={`/${locale}/cookie-settings`}
          label={t('common:footer.cookieSettings')}
          style={{ alignSelf: 'center' }}
        />
        <Footer.Link
          as="a"
          rel="noopener noreferrer"
          target="_blank"
          href={t('common:footer.accessibilityStatementLink')}
          label={t('common:footer.accessibilityStatement')}
          aria-label={`${t('common:footer.accessibilityStatement')} - ${newTabText}`}
          icon={<IconLinkExternal />}
        />
        <Footer.Link
          as="a"
          rel="noopener noreferrer"
          target="_blank"
          href={t('common:footer.privacyPolicyLink')}
          label={t('common:footer.privacyPolicy')}
          aria-label={`${t('common:footer.privacyPolicy')} - ${t('common:footer.privacyPolicyPDF')} - ${t(
            'common:footer.newTab',
          )}`}
          icon={<IconLinkExternal />}
        />
        <Footer.Link
          as="a"
          rel="noopener noreferrer"
          target="_blank"
          href={t('common:footer.feedbackLink')}
          label={t('common:footer.feedback')}
          aria-label={`${t('common:footer.feedback')} - ${newTabText}`}
          icon={<IconLinkExternal />}
        />
        <Footer.Link
          as="a"
          rel="noopener noreferrer"
          target="_blank"
          href={t('common:footer.moreInfoLink')}
          label={t('common:footer.moreInfo')}
          aria-label={`${t('common:footer.moreInfo')} - ${newTabText}`}
          icon={<IconLinkExternal />}
        />
      </Footer.Base>
    </Footer>
  );
};

export default FooterSection;
