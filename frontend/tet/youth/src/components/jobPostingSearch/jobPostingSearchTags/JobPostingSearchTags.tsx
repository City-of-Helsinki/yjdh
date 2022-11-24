import { Tag } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { convertToUIDateFormat } from 'shared/utils/date.utils';
import { QueryParams } from 'tet/youth/types/queryparams';
import { OptionType } from 'tet-shared/types/classification';

import { $RemoveButton, $Tags } from './JobPostingSearchTags.sc';

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
  const startText = `${initParams.start ? convertToUIDateFormat(initParams.start) : ''}`;
  const endText = `${initParams.end ? convertToUIDateFormat(initParams.end) : ''}`;
  const dateText = startText + (startText.length > 0 || endText.length > 0 ? '-' : '') + endText;
  const chosenLanguage = languageOptions.find((language) => language.value === initParams?.language);

  const { t } = useTranslation();

  return (
    <$Tags id="searchTags">
      {initParams?.text && (
        <li>
          <Tag
            className="searchTag"
            onDelete={() => onRemoveFilter('text')}
            deleteButtonAriaLabel={t('common:filters.removeFilter', { filter: initParams.text })}
          >
            {initParams.text}
          </Tag>
        </li>
      )}
      {initKeywords.length > 0 &&
        initKeywords.map((keyword) => (
          <li>
            <Tag
              onDelete={() => onRemoveKeyword(keyword)}
              deleteButtonAriaLabel={t('common:filters.removeFilter', { filter: keyword.label })}
              theme={{
                '--tag-background': `var(--color-engel-medium-light)`,
                '--tag-color': 'theme.colors.black80',
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
            className="searchTag"
            deleteButtonAriaLabel={t('common:filters.removeDateFilter')}
            theme={{
              '--tag-background': `var(--color-summer-medium-light)`,
              '--tag-color': 'theme.colors.black90',
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
            className="searchTag"
            deleteButtonAriaLabel={t('common:filters.removeLanguageFilter')}
            theme={{
              '--tag-background': `var(--color-coat-of-arms-light)`,
              '--tag-color': 'theme.colors.black90',
              '--tag-focus-outline-color': 'var(--color-black-90)',
            }}
          >
            {chosenLanguage.label}
          </Tag>
        </li>
      )}
      {Object.keys(initParams).length > 0 && (
        <li>
          <$RemoveButton id="removeAllSearches" onClick={() => onRemoveFilter('all')} role="button">
            {t('common:filters.clearFilters')}
          </$RemoveButton>
        </li>
      )}
    </$Tags>
  );
};

export default PostingSearchTags;
