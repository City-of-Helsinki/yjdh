import { Link } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { QueryParams } from 'tet/youth/types/queryparams';

import { $Links, $Title } from './NoResults.sc';

type Props = {
  params: QueryParams;
  onSearchByFilters: (value: QueryParams) => void;
  resultsTotal: number;
};

const NoResults: React.FC<Props> = ({ params, onSearchByFilters, resultsTotal }) => {
  const { t } = useTranslation();
  const searchHandler = (searchText: string): void => {
    onSearchByFilters({
      ...params,
      text: searchText,
    });
  };

  const ignoredWords = new Set([
    'että',
    'jotta',
    'joten',
    'koska',
    'kun',
    'jos',
    'vaikka',
    'kuin',
    'kunnes',
    'ja',
    'sekä että',
    'eli',
    'tai',
    'vai',
    'joko tai',
    'mutta',
    'vaan',
    'sillä',
    'and',
    'och',
  ]);
  const searchWords = (): string[] => {
    const words = params.text?.toLowerCase().split(' ') ?? [];
    return words.filter((word) => !ignoredWords.has(word));
  };

  if (resultsTotal >= 5) {
    return null;
  }
  if (params.text?.includes(' ')) {
    return (
      <>
        {resultsTotal === 0 ? (
          <$Title>{t('common:postings.noResultsLinks')}</$Title>
        ) : (
          <$Title>{t('common:postings.fewResultsLinks')}</$Title>
        )}
        <$Links data-testid="search-word-links">
          {searchWords().map((word) => (
            // eslint-disable-next-line jsx-a11y/anchor-is-valid,no-script-url
            <Link size="L" onClick={() => searchHandler(word)} href="javascript:void(0)">
              {word}
            </Link>
          ))}
        </$Links>
      </>
    );
  }
  return <$Title>{t('common:postings.fewResultsText')}</$Title>;
};

export default NoResults;
