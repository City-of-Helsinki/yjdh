import React from 'react';
import Container from 'shared/components/container/Container';
import { $Banner, $BannerWrapper, $Title, $ImageWrapper } from './Banner.sc';

const Banner = () => {
  return (
    <$Banner>
      <Container>
        <$BannerWrapper>
          <$Title>Muistathan etsiä TET-paikkasi ajoissa</$Title>
          <$ImageWrapper>
            <img src="lippakioski.png" alt="canteen counter" />
          </$ImageWrapper>
        </$BannerWrapper>
      </Container>
    </$Banner>
  );
};

export default Banner;
