import { IconCross, IconPaperclip } from 'hds-react';
import * as React from 'react';

import { $ActionContainer, $Container, $Title } from './AttachmentsItem.sc';

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
  const handleClick = (): void => onClick(id);
  const handleRemove = (): void => onRemove(id);

  return (
    <$Container>
      <$Title onClick={handleClick}>
        <IconPaperclip aria-label={name} />
        {name}
      </$Title>
      <$ActionContainer onClick={handleRemove}>
        <IconCross aria-label={removeText} />
        {removeText}
      </$ActionContainer>
    </$Container>
  );
};

export default AttachmentItem;
