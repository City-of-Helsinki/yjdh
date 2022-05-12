import { Footer } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';

// import { $FooterWrapper } from './Footer.sc';

const FooterSection: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Footer title={t('common:appName')} theme="dark">
      <Footer.Base
        copyrightHolder={t('common:footer.copyrightText')}
        copyrightText={t('common:footer.allRightsReservedText')}
      >
        <Footer.Item
          as="a"
          rel="noopener noreferrer"
          target="_blank"
          href={t('common:footer.accessibilityStatementLink')}
          label={t('common:footer.accessibilityStatement')}
          aria-label={`${t('common:footer.accessibilityStatement')} - ${t('common:footer.newTab')}`}
        />
        <Footer.Item
          as="a"
          rel="noopener noreferrer"
          target="_blank"
          href={t('common:footer.privacyPolicyLink')}
          label={t('common:footer.privacyPolicy')}
          aria-label={`${t('common:footer.privacyPolicy')} - ${t('common:footer.newTab')}`}
        />
        <Footer.Item
          as="a"
          rel="noopener noreferrer"
          target="_blank"
          href={t('common:footer.feedbackLink')}
          label={t('common:footer.feedback')}
          aria-label={`${t('common:footer.feedback')} - ${t('common:footer.newTab')}`}
        />
      </Footer.Base>
    </Footer>
  );
};

export default FooterSection;
