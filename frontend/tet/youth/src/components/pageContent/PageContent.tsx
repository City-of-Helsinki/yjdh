import { Button, IconMap } from 'hds-react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import React from 'react';

import { $ButtonWrapper, $ImageWrapper, $PageContent, $Textbox, $TextboxTitle } from './PageContent.sc';

const PageContent: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const showMapHandler = (): void => {
    void router.push(
      {
        pathname: '/postings',
        query: {
          init_map: true,
        },
      },
      '/postings',
    );
  };
  /* eslint-disable no-secrets/no-secrets */
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
            priority
          />
        </$ImageWrapper>
        <$Textbox>
          <$TextboxTitle>{t('common:frontPage.boxTitle')}</$TextboxTitle>
          <div>{t('common:frontPage.boxContent')}</div>
        </$Textbox>
      </$PageContent>
    </>
  );
  /* eslint-enable no-secrets/no-secrets */
};

export default PageContent;
