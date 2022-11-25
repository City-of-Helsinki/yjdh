import { Button, DateInput, IconAngleRight, IconSearch, TextInput } from 'hds-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { Language } from 'shared/i18n/i18n';

import {
  $ButtonContainer,
  $DateField,
  $Filters,
  $FiltersLink,
  $SearchBar,
  $SearchBarWrapper,
  $SearchField,
  $SearchText,
} from './QuickSearch.sc';

const QuickSearch: React.FC = () => {
  const router = useRouter();
  const [searchText, setSearchText] = React.useState<string>('');
  const [startTime, setStartTime] = React.useState('');
  const { t, i18n } = useTranslation();

  const searchHandler = (): void => {
    const searchQuery = {
      ...(searchText.length > 0 && { text: searchText }),
      ...(startTime.length > 0 && { start: startTime }),
    };

    void router.push({
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
            />
          </$SearchField>
          <$DateField>
            <DateInput
              id="start_time"
              data-testid="startInput"
              onChange={(value) => setStartTime(value)}
              value={startTime}
              language={i18n.language as Language}
              placeholder={t('common:filters.startDate')}
            />
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
