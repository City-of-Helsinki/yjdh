import React from 'react';
import Linkbox from 'tet/youth/components/linkbox/Linkbox';
import { $LinkSection } from './LinkSection.sc';
import { useTranslation } from 'next-i18next';

const LinkSection = () => {
  const { t } = useTranslation();
  return (
    <$LinkSection>
      <Linkbox
        title={t('common:frontPage.announceLinkTitle')}
        link={t('common:frontPage.announceLinkURL')}
        content={t('common:frontPage.announceLinkContent')}
      />
      <Linkbox
        title={t('common:frontPage.askLinkTitle')}
        link={t('common:frontPage.askLinkURL')}
        content={t('common:frontPage.askLinkContent')}
      />
    </$LinkSection>
  );
};

export default LinkSection;
