import React from 'react';
import { Link } from 'hds-react';
import { $Title, $Links } from './NoResults.sc';
import { QueryParams } from 'tet/youth/types/queryparams';
import { useTranslation } from 'next-i18next';

type Props = {
  params: QueryParams;
  onSearchByFilters: (value: QueryParams) => void;
  resultsTotal: number;
};

const NoResults: React.FC<Props> = ({ params, onSearchByFilters, resultsTotal }) => {
  const { t } = useTranslation();
  const searchHandler = (searchText: string) => {
    onSearchByFilters({
      ...params,
      text: searchText,
    });
  };

  const ignoredWords = [
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
  ];
  const searchWords = () => {
    if (params && params.hasOwnProperty('text')) {
      const searchWords = params.text.toLowerCase().split(' ');
      return searchWords.filter((word) => {
        return !ignoredWords.includes(word);
      });
    } else {
      return [];
    }
  };

  if (resultsTotal >= 5) {
    return null;
  }
  if (params.text && params.text.indexOf(' ') >= 0) {
    return (
      <>
        {resultsTotal === 0 ? (
          <$Title>{t('common:postings.noResultsLinks')}</$Title>
        ) : (
          <$Title>{t('common:postings.fewResultsLinks')}</$Title>
        )}
        <$Links>
          {searchWords().map((word) => (
            <Link size="L" onClick={() => searchHandler(word)} href="javascript:void(0)">
              {word}
            </Link>
          ))}
        </$Links>
      </>
    );
  } else {
    return <$Title>{t('common:postings.noResultsText')}</$Title>;
  }
};

export default NoResults;
