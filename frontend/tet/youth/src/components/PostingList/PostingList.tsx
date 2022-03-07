import React from 'react';
import { LinkedEventsPagedResponse, LocalizedObject, TetEvent } from 'tet/youth/linkedevents';

const getLocalizedString = (obj: LocalizedObject): string => obj.fi;

type Props = {
  postings: any;
};

const PostingList: React.FC<Props> = ({ postings }) => {
  return (
    <div>
      <h1>Tet-paikat testi</h1>
      {/*
      <ol>
        {postings.map((posting) => (
          <li key={posting.id}>{getLocalizedString(posting.name)}</li>
        ))}
      </ol>
			*/}
    </div>
  );
};

export default PostingList;
