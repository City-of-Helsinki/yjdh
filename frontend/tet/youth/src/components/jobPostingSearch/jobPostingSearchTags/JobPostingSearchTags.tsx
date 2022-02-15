import React from 'react';
import { Tag } from 'hds-react';
import { QueryParams } from 'tet/youth/types/queryparams';
import { convertToUIDateFormat } from 'shared/utils/date.utils';
import { $Tags, $RemoveButton } from './JobPostingSearchTags.sc';
import { useTranslation } from 'next-i18next';
import { OptionType } from 'tet-shared/types/classification';

type Props = {
  initParams: QueryParams;
  onRemoveFilter: (removeKeys: keyof QueryParams | Array<keyof QueryParams> | 'all') => void;
  workMethods: OptionType[];
};

const PostingSearchTags: React.FC<Props> = ({ initParams, onRemoveFilter, workMethods }) => {
  const startText = `${initParams.hasOwnProperty('start') ? convertToUIDateFormat(initParams.start as string) : ''}`;
  const endText = `${initParams.hasOwnProperty('end') ? convertToUIDateFormat(initParams.end as string) : ''}`;
  const dateText = startText + (startText.length || endText.length ? '-' : '') + endText;
  const { t } = useTranslation();

  const getWorkMethodLabel = () => {
    const workMethod = workMethods.find((item) => item.value === initParams.keyword);
    return workMethod ? workMethod.label : '';
  };

  return (
    <$Tags>
      {initParams?.text && (
        <li>
          <Tag onDelete={() => onRemoveFilter('text')}>{initParams.text}</Tag>
        </li>
      )}
      {initParams?.keyword && (
        <li>
          <Tag
            onDelete={() => onRemoveFilter('keyword')}
            theme={{
              '--tag-background': `var(--color-engel-medium-light)`,
              '--tag-color': 'var(--color-black-90)',
              '--tag-focus-outline-color': 'var(--color-black-90)',
            }}
          >
            {getWorkMethodLabel()}
          </Tag>
        </li>
      )}
      {dateText.length > 0 && (
        <li>
          <Tag
            onDelete={() => onRemoveFilter(['start', 'end'])}
            theme={{
              '--tag-background': `var(--color-engel-medium-light)`,
              '--tag-color': 'var(--color-black-90)',
              '--tag-focus-outline-color': 'var(--color-black-90)',
            }}
          >
            {dateText}
          </Tag>
        </li>
      )}
      {Object.keys(initParams).length > 0 && (
        <li>
          <$RemoveButton onClick={() => onRemoveFilter('all')}>{t('common:filters.clearFilters')}</$RemoveButton>
        </li>
      )}
    </$Tags>
  );
};

export default PostingSearchTags;
