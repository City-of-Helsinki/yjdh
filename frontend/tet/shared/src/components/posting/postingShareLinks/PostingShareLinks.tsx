import { IconFacebook, IconLink, IconLinkedin, IconTwitter } from 'hds-react';
import React from 'react';
import {
  $Links,
  $ShareButton,
  $ShareTitle,
} from 'tet-shared//components/posting/postingShareLinks/PostingShareLinks.sc';

const PostingShareLinks: React.FC = () => (
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

export default PostingShareLinks;
