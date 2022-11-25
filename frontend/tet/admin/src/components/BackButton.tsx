import { IconArrowLeft } from 'hds-react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import React from 'react';
import styled from 'styled-components';

const BackButton: React.FC = () => {
  const { t } = useTranslation();

  const $BackButton = styled.a`
    display: inline-flex;
    align-items: center;
    color: inherit;
    text-decoration: none;
    font-size: ${(props) => props.theme.fontSize.body.l};
    font-weight: normal;
  `;

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
