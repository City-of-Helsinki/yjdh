import { Tag } from 'hds-react';
import * as React from 'react';
import { OptionType } from 'tet-shared/types/classification';

type Props = {
  list: OptionType[];
  color: string;
};

const KeyWordList: React.FC<Props> = ({ list, color }) => (
  <>
    {list.map((keyword: OptionType) => (
      <li>
        <Tag
          theme={{
            '--tag-background': `var(--color-${color})`,
            '--tag-color': 'var(--color-black-90)',
            '--tag-focus-outline-color': 'var(--color-black-90)',
          }}
        >
          {keyword.name}
        </Tag>
      </li>
    ))}
  </>
);

export default KeyWordList;
