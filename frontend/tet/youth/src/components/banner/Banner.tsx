import React from 'react';
import Container from 'shared/components/container/Container';
import { $Banner, $BannerWrapper, $Title, $ImageWrapper } from './Banner.sc';
import Image from 'next/image';

const Banner = () => {
  return (
    <$Banner>
      <Container>
        <$BannerWrapper>
          <$Title>Muistathan etsiä TET-paikkasi ajoissa</$Title>
          <$ImageWrapper>
            <Image
              width="100%"
              height="100%"
              layout="responsive"
              objectFit="contain"
              src="/lippakioski.png"
              alt="canteen counter"
            />
          </$ImageWrapper>
        </$BannerWrapper>
      </Container>
    </$Banner>
  );
};

export default Banner;
