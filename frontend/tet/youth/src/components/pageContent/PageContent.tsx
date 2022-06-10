import React from 'react';
import Image from 'next/image';
import { $ImageWrapper, $PageContent, $Textbox, $TextboxTitle, $ButtonWrapper } from './PageContent.sc';
import { useTranslation } from 'next-i18next';
import { Button, IconMap } from 'hds-react';
import { useRouter } from 'next/router';

const PageContent = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const showMapHandler = () => {
    router.push(
      {
        pathname: '/postings',
        query: {
          init_map: true,
        },
      },
      '/postings',
    );
  };
  return (
    <>
      <$ButtonWrapper>
        <Button onClick={showMapHandler} iconRight={<IconMap />}>
          {t('common:map.showMap')}
        </Button>
      </$ButtonWrapper>
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
    </>
  );
};

export default PageContent;
