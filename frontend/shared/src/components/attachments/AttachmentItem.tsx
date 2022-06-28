import { IconCross, IconPaperclip } from 'hds-react';
import * as React from 'react';

import { $ActionContainer, $Container, $Title } from './AttachmentsItem.sc';
import useGetAbbreviatedFileName from 'shared/hooks/useGetAbbreviatedFileName';

export interface AttachmentItemProps {
  id: string;
  name: string;
  removeText: string;
  onClick: (id: string) => void;
  onRemove: (id: string) => void;
}

const AttachmentItem: React.FC<AttachmentItemProps> = ({
  id,
  name,
  removeText,
  onClick,
  onRemove,
}) => {
  const handleClick = (e: React.MouseEvent<HTMLElement>): void => {
    e.preventDefault();
    onClick(id);
  };
  const handleRemove = (e: React.MouseEvent<HTMLElement>): void => {
    e.preventDefault();
    onRemove(id);
  };

  const abbreviation = useGetAbbreviatedFileName(name);

  return (
    <$Container>
      <$Title onClick={handleClick} aria-label={name} href="#">
        <IconPaperclip aria-label={name} />
        {abbreviation}
      </$Title>
      <$ActionContainer onClick={handleRemove} aria-label={removeText} href="#">
        <IconCross aria-label={removeText} />
        {removeText}
      </$ActionContainer>
    </$Container>
  );
};

export default AttachmentItem;
