// eslint-disable-next-line import/no-extraneous-dependencies
import React from 'react';
import {
  $Header,
  $InfoItem,
  $List,
  $Title,
} from 'tet-shared//components/posting/postingInfoItem/PostingInfoItem.sc';

type Props = {
  title: string;
  body: string | string[] | JSX.Element;
  icon?: JSX.Element;
};

const PostingInfoItem: React.FC<Props> = ({ title, body, icon }) => {
  const list = Array.isArray(body) ? body : [body];
  return (
    <$InfoItem>
      <$Header>
        {icon ? (
          <>
            {icon}
            <$Title>{title}</$Title>
          </>
        ) : (
          <span>{title}</span>
        )}
      </$Header>
      <$List>
        {list.map((item, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <li key={index}>{item}</li>
        ))}
      </$List>
    </$InfoItem>
  );
};

export default PostingInfoItem;
