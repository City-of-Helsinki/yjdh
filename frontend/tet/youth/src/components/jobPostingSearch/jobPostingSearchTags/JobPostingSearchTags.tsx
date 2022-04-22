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
  onRemoveKeyword: (keyword: OptionType) => void;
  initKeywords: OptionType[];
  languageOptions: OptionType[];
};

const PostingSearchTags: React.FC<Props> = ({
  initParams,
  onRemoveFilter,
  initKeywords,
  onRemoveKeyword,
  languageOptions,
}) => {
  const startText = `${initParams.hasOwnProperty('start') ? convertToUIDateFormat(initParams.start as string) : ''}`;
  const endText = `${initParams.hasOwnProperty('end') ? convertToUIDateFormat(initParams.end as string) : ''}`;
  const dateText = startText + (startText.length || endText.length ? '-' : '') + endText;
  const chosenLanguage = languageOptions.find((language) => language.value === initParams?.language);

  const { t } = useTranslation();

  return (
    <$Tags>
      {initParams?.text && (
        <li>
          <Tag onDelete={() => onRemoveFilter('text')}>{initParams.text}</Tag>
        </li>
      )}
      {initKeywords.length > 0 &&
        initKeywords.map((keyword) => (
          <li>
            <Tag
              onDelete={() => onRemoveKeyword(keyword)}
              theme={{
                '--tag-background': `var(--color-engel-medium-light)`,
                '--tag-color': 'var(--color-black-80)',
                '--tag-focus-outline-color': 'var(--color-black-80)',
              }}
            >
              {keyword.label}
            </Tag>
          </li>
        ))}
      {dateText.length > 0 && (
        <li>
          <Tag
            onDelete={() => onRemoveFilter(['start', 'end'])}
            theme={{
              '--tag-background': `var(--color-summer-medium-light)`,
              '--tag-color': 'var(--color-black-90)',
              '--tag-focus-outline-color': 'var(--color-black-90)',
            }}
          >
            {dateText}
          </Tag>
        </li>
      )}
      {chosenLanguage && (
        <li>
          <Tag
            onDelete={() => onRemoveFilter('language')}
            theme={{
              '--tag-background': `var(--color-coat-of-arms-light)`,
              '--tag-color': 'var(--color-black-90)',
              '--tag-focus-outline-color': 'var(--color-black-90)',
            }}
          >
            {chosenLanguage.label}
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
