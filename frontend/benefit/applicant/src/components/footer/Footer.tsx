import { useTranslation } from 'benefit/applicant/i18n';
import { Footer } from 'hds-react';
import React from 'react';

import { $FooterWrapper } from './Footer.sc';

const FooterSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <$FooterWrapper>
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
          />
          <Footer.Item
            as="a"
            rel="noopener noreferrer"
            target="_blank"
            href={t('common:footer.aboutTheServiceLink')}
            label={t('common:footer.aboutTheService')}
          />
        </Footer.Base>
      </Footer>
    </$FooterWrapper>
  );
};

export default FooterSection;
