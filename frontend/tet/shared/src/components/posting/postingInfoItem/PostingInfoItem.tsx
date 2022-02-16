import React from 'react';
import {
  $InfoItem,
  $Header,
  $List,
} from 'tet/shared/src/components/posting/postingInfoItem/PostingInfoItem.sc';

type Props = {
  title: string;
  body: string | string[];
  icon: JSX.Element;
};

const PostingInfoItem: React.FC<Props> = ({ title, body, icon }) => {
  const list = Array.isArray(body) ? body : [body];
  return (
    <$InfoItem>
      <$Header>
        {icon}
        <span>{title}</span>
      </$Header>
      <$List>
        {list.map((item) => (
          <li>{item}</li>
        ))}
      </$List>
    </$InfoItem>
  );
};

export default PostingInfoItem;
