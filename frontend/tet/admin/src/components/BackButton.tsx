import React from 'react';
import { IconArrowLeft } from 'hds-react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import { useRouter } from 'next/router';

const BackButton: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation();

  const $BackButton = styled.div`
    display: inline-flex;
    align-items: center;
    cursor: pointer;
    font-size: ${(props) => props.theme.fontSize.body.l};
    font-weight: normal;
  `;

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
