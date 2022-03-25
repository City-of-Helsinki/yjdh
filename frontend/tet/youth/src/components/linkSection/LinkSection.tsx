import React from 'react';
import Linkbox from 'tet/youth/components/linkbox/Linkbox';
import { $LinkSection, $Links } from './LinkSection.sc';
import { useTranslation } from 'next-i18next';

const LinkSection = () => {
  const { t } = useTranslation();
  return (
    <$LinkSection>
      <$Links>
        <Linkbox
          title={t('common:frontPage.askLinkTitle')}
          link={t('common:frontPage.askLinkURL')}
          content={t('common:frontPage.askLinkContent')}
        />
      </$Links>
    </$LinkSection>
  );
};

export default LinkSection;
