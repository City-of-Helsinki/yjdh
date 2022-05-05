import React from 'react';
import Image from 'next/image';
import { $ImageWrapper, $PageContent, $Textbox, $TextboxTitle } from './PageContent.sc';
import { useTranslation } from 'next-i18next';

const PageContent = () => {
  const { t } = useTranslation();
  return (
    <$PageContent>
      <$ImageWrapper>
        <Image
          width="100%"
          height="100%"
          layout="responsive"
          objectFit="contain"
          src="/etela-haaga_kirjasto_230421_kuva_jussi_hellsten_0693.jpg"
          alt="etela haaga kirjasto"
          priority={true}
        />
      </$ImageWrapper>
      <$Textbox>
        <$TextboxTitle>{t('common:frontPage.boxTitle')}</$TextboxTitle>
        <div>{t('common:frontPage.boxContent')}</div>
      </$Textbox>
    </$PageContent>
  );
};

export default PageContent;
