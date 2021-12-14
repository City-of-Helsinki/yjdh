import { Footer, IconLinkExternal } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';

import { $FooterWrapper } from './Footer.sc';

const FooterSection: React.FC = () => {
  const { t } = useTranslation();
  return (
    <$FooterWrapper>
      <Footer title={t('common:appName')} theme="dark">
        <Footer.Utilities backToTopLabel={t('common:footer.backToTop')}>
          <Footer.SoMe />
          <Footer.Item
            as="a"
            rel="noopener noreferrer"
            target="_blank"
            href={t('common:footer.contactUsLink')}
            label={t('common:footer.contactUs')}
          >
            <IconLinkExternal />
          </Footer.Item>
        </Footer.Utilities>
        <Footer.Base
          copyrightHolder={t('common:footer.copyrightText')}
          copyrightText={t('common:footer.allRightsReservedText')}
        >
          <Footer.Item
            as="a"
            rel="noopener noreferrer"
            target="_blank"
            href={t('common:footer.registerInformationLink')}
            label={t('common:footer.registerInformation')}
          />
          <Footer.Item
            as="a"
            rel="noopener noreferrer"
            target="_blank"
            href={t('common:footer.informationLink')}
            label={t('common:footer.information')}
          />
          <Footer.Item
            as="a"
            rel="noopener noreferrer"
            target="_blank"
            href={t('common:footer.accessibilityStatementLink')}
            label={t('common:footer.accessibilityStatement')}
          />
        </Footer.Base>
      </Footer>
    </$FooterWrapper>
  );
};

export default FooterSection;
