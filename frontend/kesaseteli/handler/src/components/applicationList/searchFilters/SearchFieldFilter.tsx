import { Button, ButtonVariant, TextInput } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React, { useState } from 'react';
import styled, { DefaultTheme } from 'styled-components';

const FILTER_WIDTH = '454px';

const $Wrapper = styled.div`
  margin-bottom: 1rem;
  display: flex;
  align-items: flex-end;
  gap: ${(props: { theme: DefaultTheme }) => props.theme.spacing.s};
  width: ${FILTER_WIDTH};
`;

const $TextInput = styled(TextInput)`
  flex: 1;
  min-width: 0;
`;

type SearchFieldFilterProps = {
  id: string;
  onSearch: (search: string) => void;
  search?: string;
  value?: string;
  label?: string;
  placeholder?: string;
  buttonText?: string;
  resetButtonText?: string;
};

export default function SearchFieldFilter({
  id,
  onSearch,
  search,
  value: propValue,
  label,
  placeholder,
  buttonText,
  resetButtonText,
}: Readonly<SearchFieldFilterProps>): React.JSX.Element {
  const { t } = useTranslation();
  const initialValue = propValue ?? search ?? '';
  const [searchValue, setSearchValue] = useState<string>(initialValue);

  const handleSearch = (): void => {
    onSearch(searchValue);
  };

  const handleReset = (): void => {
    setSearchValue('');
    onSearch('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <$Wrapper>
      <$TextInput
        id={id}
        label={label ?? t('common:applicationList.filterSearch', 'Haku')}
        placeholder={
          placeholder ??
          t('common:applicationList.filterSearchPlaceholder', 'Hae hakemuksia')
        }
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <Button id={`${id}-search-button`} onClick={handleSearch} type="button">
        {buttonText ?? t('common:applicationList.searchButton', 'Hae')}
      </Button>
      <Button
        id={`${id}-reset-button`}
        variant={ButtonVariant.Secondary}
        onClick={handleReset}
        type="button"
      >
        {resetButtonText ?? t('common:applicationList.resetButton', 'Tyhjennä')}
      </Button>
    </$Wrapper>
  );
}
