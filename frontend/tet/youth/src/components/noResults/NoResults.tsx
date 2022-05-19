import React from 'react';
import { Link } from 'hds-react';
import { $Title, $Links } from './NoResults.sc';
import { QueryParams } from 'tet/youth/types/queryparams';

type Props = {
  params: QueryParams;
  onSearchByFilters: (value: QueryParams) => void;
  zeroResults: Boolean;
};

const NoResults: React.FC<Props> = ({ params, onSearchByFilters, zeroResults }) => {
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

  return (
    <>
      {zeroResults ? (
        <$Title>
          Valitsemillasi hakuehdoilla ei löytynyt yhtään tapahtumaa. Kokeile vaikka klikkaamalla jotain näistä:
        </$Title>
      ) : (
        <$Title>Kokeile hakua myös vain seuraavilla rajauksilla:</$Title>
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
};

export default NoResults;
