import React from 'react';
import { IconArrowLeft } from 'hds-react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import Link from 'next/link';

const BackButton: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation();

  const $BackButton = styled.a`
    display: inline-flex;
    align-items: center;
    color: inherit;
    text-decoration: none;
    font-size: ${(props) => props.theme.fontSize.body.l};
    font-weight: normal;
  `;

  const clickHandler = () => {
    void router.push('/');
  };

  return (
    <Link href="/" passHref>
      <$BackButton>
        <IconArrowLeft />
        <span>{t('common:application.backToFrontPage')}</span>
      </$BackButton>
    </Link>
  );
};

export default BackButton;
