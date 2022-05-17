import React from 'react';
import { IconArrowLeft } from 'hds-react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { $BackButton } from './BackButton.sc';

const BackButton: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation();

  const clickHandler = () => {
    void router.push('/');
  };

  return (
    <$BackButton onClick={clickHandler}>
      <IconArrowLeft />
      <span>{t('common:application.backToFrontPage')}</span>
    </$BackButton>
  );
};

export default BackButton;
