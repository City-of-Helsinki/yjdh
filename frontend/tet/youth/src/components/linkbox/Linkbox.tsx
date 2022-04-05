import React from 'react';
import { $Linkbox, $TitleWrapper, $TitleText, $BoxContent } from './Linkbox.sc';
import { IconArrowRight } from 'hds-react';

type Props = {
  title: string;
  link: string;
  content: string;
};

const Linkbox: React.FC<Props> = ({ title, link, content }) => {
  return (
    <$Linkbox>
      <$TitleWrapper href={link} rel="noopener noreferrer" target="_blank">
        <$TitleText>{title}</$TitleText>
        <IconArrowRight size={'l'} />
      </$TitleWrapper>
      <$BoxContent>{content}</$BoxContent>
    </$Linkbox>
  );
};

export default Linkbox;
