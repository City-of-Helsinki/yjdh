import React from 'react';
import { Tag } from 'hds-react';
import { QueryParams } from 'tet/youth/types/queryparams';
import { convertToUIDateFormat } from 'shared/utils/date.utils';

type Props = {
  initParams: QueryParams;
  onRemoveFilter: (filter: keyof QueryParams) => void;
};

const PostingSearchTags: React.FC<Props> = ({ initParams, onRemoveFilter }) => {
  const startText = `${initParams.hasOwnProperty('start') ? convertToUIDateFormat(initParams.start as string) : ''}`;
  const endText = `${initParams.hasOwnProperty('end') ? convertToUIDateFormat(initParams.end as string) : ''}`;
  const dateText = startText + (startText.length || endText.length ? '-' : '') + endText;

  return (
    <div>
      {initParams?.text && <Tag onClick={() => onRemoveFilter('text')}>{initParams.text}</Tag>}
      <Tag
        theme={{
          '--tag-background': `var(--color-engel-medium-light)`,
          '--tag-color': 'var(--color-black-90)',
          '--tag-focus-outline-color': 'var(--color-black-90)',
        }}
      >
        {dateText}
      </Tag>
    </div>
  );
};

export default PostingSearchTags;
