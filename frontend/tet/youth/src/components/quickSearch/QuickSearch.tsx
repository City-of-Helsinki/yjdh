import React from 'react';
import {
  $SearchBar,
  $SearchBarWrapper,
  $SearchText,
  $Filters,
  $SearchField,
  $DateField,
  $ButtonContainer,
  $FiltersLink,
} from './QuickSearch.sc';
import { convertToBackendDateFormat } from 'shared/utils/date.utils';
import { TextInput, Button, DateInput, IconSearch, IconAngleRight } from 'hds-react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { Language } from 'shared/i18n/i18n';

const QuickSearch = () => {
  const router = useRouter();
  const [searchText, setSearchText] = React.useState<string>('');
  const [startTime, setStartTime] = React.useState('');
  const { t, i18n } = useTranslation();

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
      <$SearchBarWrapper>
        <$SearchText>{t('common:frontPage.search')}</$SearchText>
        <$Filters>
          <$SearchField>
            <TextInput
              onChange={(e) => setSearchText(e.target.value)}
              value={searchText}
              id="searchText"
              data-testid="quickSearchInput"
              placeholder={t('common:filters.searchPlaceholder')}
            ></TextInput>
          </$SearchField>
          <$DateField>
            <DateInput
              id="start_time"
              data-testid="startInput"
              onChange={(value) => setStartTime(value)}
              value={startTime}
              language={i18n.language as Language}
              placeholder={t('common:filters.startDate')}
            ></DateInput>
          </$DateField>
          <$ButtonContainer>
            <Button
              onClick={searchHandler}
              css={`
                background-color: #008567;
                border-color: #008567 !important;
                width: 100%;
              `}
              theme="black"
              iconLeft={<IconSearch />}
            >
              {t('common:frontPage.fetch')}
            </Button>
          </$ButtonContainer>
        </$Filters>
      </$SearchBarWrapper>
      <Link href="/postings" passHref>
        <$FiltersLink>
          {t('common:frontPage.advancedSearch')} <IconAngleRight aria-hidden />
        </$FiltersLink>
      </Link>
    </$SearchBar>
  );
};

export default QuickSearch;
