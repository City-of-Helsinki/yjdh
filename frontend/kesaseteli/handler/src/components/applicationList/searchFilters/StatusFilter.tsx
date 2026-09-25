import { Select } from 'hds-react';
import {
  ApplicationListType,
  StatusTypeForListType,
} from 'kesaseteli/handler/types/application';
import { useTranslation } from 'next-i18next';
import React, { useMemo } from 'react';
import FieldErrorMessage from 'shared/components/forms/fields/fieldErrorMessage/FieldErrorMessage';
import { OptionType } from 'shared/types/common';
import styled from 'styled-components';

const $Wrapper = styled.div`
  margin-bottom: 1rem;
`;

type StatusFilterProps<T extends ApplicationListType> = {
  id: string;
  statuses: StatusTypeForListType<T>[];
  selectedStatuses: StatusTypeForListType<T>[];
  onChange: (statuses: StatusTypeForListType<T>[]) => void;
  listType: T;
};

function StatusFilter<T extends ApplicationListType>({
  id,
  statuses,
  selectedStatuses,
  onChange,
  listType,
}: Readonly<StatusFilterProps<T>>): React.JSX.Element {
  const { t } = useTranslation();

  const options = useMemo<OptionType<StatusTypeForListType<T>>[]>(
    () =>
      statuses.map((status) => ({
        label: t(`common:applicationList.${listType}.status.${status}`),
        value: status,
      })),
    [listType, statuses, t]
  );

  const selectedOptions = useMemo(
    () => options.filter((option) => selectedStatuses.includes(option.value)),
    [options, selectedStatuses]
  );
  // The status filter is invalid when no options are selected
  const isInvalid = selectedStatuses.length === 0;

  return (
    <$Wrapper>
      <Select
        id={id}
        multiSelect
        texts={{
          label: t('common:applicationList.columns.status'),
        }}
        options={options}
        value={selectedOptions}
        invalid={isInvalid}
        onChange={(nextSelectedOptions) => {
          const nextStatuses = nextSelectedOptions.map(
            (option) => option.value as StatusTypeForListType<T>
          );
          onChange(nextStatuses);
        }}
      />
      {isInvalid && (
        <FieldErrorMessage data-testid={`${id}-error`}>
          {t('common:applicationList.filterError')}
        </FieldErrorMessage>
      )}
    </$Wrapper>
  );
}

export default StatusFilter;
