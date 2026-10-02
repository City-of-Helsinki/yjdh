import { Select } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React, { useMemo } from 'react';
import { OptionType } from 'shared/types/common';
import styled from 'styled-components';

const $Wrapper = styled.div`
  margin-bottom: 1rem;
`;

type YearFilterProps = {
  id: string;
  selectedYear: number;
  onChange: (year: number) => void;
};

export default function YearFilter({
  id,
  selectedYear,
  onChange,
}: Readonly<YearFilterProps>): React.JSX.Element {
  const { t } = useTranslation();

  const currentYear = new Date().getFullYear();
  const options = useMemo<OptionType<string>[]>(() => {
    const years = [];
    const maxYear = Math.max(currentYear + 1, 2026);
    for (let year = maxYear; year >= 2021; year -= 1) {
      years.push(year);
    }
    return years.map((year) => ({
      label: String(year),
      value: String(year),
    }));
  }, [currentYear]);

  const selectedOption =
    options.find((o) => o.value === String(selectedYear)) ?? options[0];

  return (
    <$Wrapper>
      <Select
        id={id}
        texts={{
          label: t('common:applicationList.filterYear'),
          placeholder: t(
            'common:applicationList.filterYearPlaceholder',
            'Select year'
          ),
        }}
        options={options}
        value={selectedOption ? [selectedOption] : []}
        onChange={(selectedOptions: OptionType<string>[]) => {
          const selected = selectedOptions[0];
          if (selected) {
            onChange(Number(selected.value));
          }
        }}
        clearable={false}
      />
    </$Wrapper>
  );
}
