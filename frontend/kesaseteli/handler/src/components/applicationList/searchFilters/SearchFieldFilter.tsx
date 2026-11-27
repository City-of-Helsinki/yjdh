import { Button, ButtonVariant, DateInput, TextInput } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React, { useEffect, useState } from 'react';
import useLocale from 'shared/hooks/useLocale';
import styled, { DefaultTheme } from 'styled-components';

const FILTER_WIDTH = '454px';

const $Wrapper = styled.div<{ $showDateInputs?: boolean }>`
  margin-bottom: 1rem;
  display: flex;
  align-items: flex-end;
  gap: ${(props: { theme: DefaultTheme }) => props.theme.spacing.s};
  ${(props) => (props.$showDateInputs ? '' : `width: ${FILTER_WIDTH};`)}
  flex-wrap: wrap;
`;

const $TextInput = styled(TextInput)`
  flex: 1;
  min-width: 200px;
`;

const $DateInput = styled(DateInput)`
  min-width: 150px;
`;

type SearchFieldFilterProps = {
  id: string;
  onSearch: (search: string, startDate?: string, endDate?: string) => void;
  search?: string;
  value?: string;
  label?: string;
  placeholder?: string;
  buttonText?: string;
  resetButtonText?: string;
  showDateInputs?: boolean;
  startDate?: string;
  endDate?: string;
  startDateLabel?: string;
  endDateLabel?: string;
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
  showDateInputs = false,
  startDate: propStartDate,
  endDate: propEndDate,
  startDateLabel,
  endDateLabel,
}: Readonly<SearchFieldFilterProps>): React.JSX.Element {
  const { t } = useTranslation();
  const locale = useLocale();

  const initialValue = propValue ?? search ?? '';
  const [searchValue, setSearchValue] = useState<string>(initialValue);
  const [startDateValue, setStartDateValue] = useState<string>(
    propStartDate ?? ''
  );
  const [endDateValue, setEndDateValue] = useState<string>(propEndDate ?? '');

  useEffect(() => {
    if (propValue !== undefined || search !== undefined) {
      setSearchValue(propValue ?? search ?? '');
    }
  }, [propValue, search]);

  useEffect(() => {
    if (propStartDate !== undefined) {
      setStartDateValue(propStartDate);
    }
  }, [propStartDate]);

  useEffect(() => {
    if (propEndDate !== undefined) {
      setEndDateValue(propEndDate);
    }
  }, [propEndDate]);

  const handleSearch = (): void => {
    if (showDateInputs) {
      onSearch(searchValue, startDateValue, endDateValue);
    } else {
      onSearch(searchValue);
    }
  };

  const handleReset = (): void => {
    setSearchValue('');
    setStartDateValue('');
    setEndDateValue('');
    if (showDateInputs) {
      onSearch('', '', '');
    } else {
      onSearch('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <$Wrapper $showDateInputs={showDateInputs}>
      {showDateInputs && (
        <>
          <$DateInput
            id={`${id}-start-date`}
            label={
              startDateLabel ??
              t('common:applicationList.filterStartDate', 'Alkupäivä')
            }
            value={startDateValue}
            onChange={(value) => setStartDateValue(value)}
            language={locale}
            disableDatePicker={process.env.NODE_ENV === 'test'}
          />
          <$DateInput
            id={`${id}-end-date`}
            label={
              endDateLabel ??
              t('common:applicationList.filterEndDate', 'Loppupäivä')
            }
            value={endDateValue}
            onChange={(value) => setEndDateValue(value)}
            language={locale}
            disableDatePicker={process.env.NODE_ENV === 'test'}
          />
        </>
      )}
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
