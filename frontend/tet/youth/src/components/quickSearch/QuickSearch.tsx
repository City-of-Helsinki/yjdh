import React from 'react';
import { $SearchBar } from './QuickSearch.sc';
import { convertToBackendDateFormat } from 'shared/utils/date.utils';
import { TextInput, Button, DateInput, IconSearch } from 'hds-react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

const QuickSearch = () => {
  const router = useRouter();
  const [searchText, setSearchText] = React.useState<string>('');
  const [startTime, setStartTime] = React.useState('');
  const { i18n } = useTranslation();

  const searchHandler = () => {
    const searchQuery = {
      ...(searchText.length > 0 && { text: searchText }),
      ...(startTime.length > 0 && { start: startTime }),
    };

    router.push({
      pathname: '/postings',
      query: {
        ...searchQuery,
      },
    });
  };

  return (
    <$SearchBar>
      <div>Etsi</div>
      <TextInput
        onChange={(e) => setSearchText(e.target.value)}
        value={searchText}
        id="searchText"
        placeholder="Kirjoita hakusana tai paikan nimi"
      ></TextInput>
      <DateInput
        id="start_time"
        onChange={(value) => setStartTime(value)}
        value={startTime}
        language={i18n.language}
        placeholder="Alkamispäivä"
      ></DateInput>
      <Button
        onClick={searchHandler}
        css={`
          background-color: #008567;
          border-color: #008567;
        `}
        theme="black"
        iconLeft={<IconSearch />}
      >
        Hae
      </Button>
    </$SearchBar>
  );
};

export default QuickSearch;
