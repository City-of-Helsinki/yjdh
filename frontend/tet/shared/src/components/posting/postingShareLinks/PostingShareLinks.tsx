import React from 'react';
import {
  $ShareTitle,
  $Links,
  $ShareButton,
} from 'tet/shared/src/components/posting/postingShareLinks/PostingShareLinks.sc';
import { IconLink, IconFacebook, IconTwitter, IconLinkedin } from 'hds-react';

const PostingShareLinks: React.FC = () => {
  return (
    <>
      <$ShareTitle>Jaa Tapahtuma</$ShareTitle>
      <$Links>
        <$ShareButton>
          <IconLink />
        </$ShareButton>
        <$ShareButton>
          <IconFacebook />
        </$ShareButton>
        <$ShareButton>
          <IconTwitter />
        </$ShareButton>
        <$ShareButton>
          <IconLinkedin />
        </$ShareButton>
      </$Links>
    </>
  );
};

export default PostingShareLinks;
