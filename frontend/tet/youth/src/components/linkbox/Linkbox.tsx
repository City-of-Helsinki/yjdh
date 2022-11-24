import { IconArrowRight } from 'hds-react';
import React from 'react';

import { $BoxContent, $Linkbox, $TitleText, $TitleWrapper } from './Linkbox.sc';

type Props = {
  title: string;
  link: string;
  content: string;
};

const Linkbox: React.FC<Props> = ({ title, link, content }) => (
  <$Linkbox>
    <$TitleWrapper href={link} rel="noopener noreferrer" target="_blank">
      <$TitleText>{title}</$TitleText>
      <IconArrowRight size="l" aria-hidden />
    </$TitleWrapper>
    <$BoxContent>{content}</$BoxContent>
  </$Linkbox>
);

export default Linkbox;
