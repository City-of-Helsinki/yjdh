import { Select } from 'hds-react';
import {
  ApplicationListType,
  StatusTypeForListType,
} from 'kesaseteli/handler/types/application';
import { useTranslation } from 'next-i18next';
import React, { useEffect, useMemo, useState } from 'react';
import FieldErrorMessage from 'shared/components/forms/fields/fieldErrorMessage/FieldErrorMessage';
import { OptionType } from 'shared/types/common';
import styled from 'styled-components';

const $Wrapper = styled.div`
  margin-bottom: 1rem;
`;

type StatusFilterProps<T extends ApplicationListType> = {
  id: string;
  statuses: StatusTypeForListType<T>[];
  defaultSelectedStatuses?: StatusTypeForListType<T>[];
  onChange: (statuses: StatusTypeForListType<T>[]) => void;
  listType: T;
};

type UseStatusFilterProps<T extends ApplicationListType> = {
  defaultSelectedStatuses?: StatusTypeForListType<T>[];
  statuses: StatusTypeForListType<T>[];
};

export function useStatusFilter<T extends ApplicationListType>({
  defaultSelectedStatuses,
  statuses,
}: Readonly<UseStatusFilterProps<T>>): {
  selectedStatuses: StatusTypeForListType<T>[];
  setSelectedStatuses: React.Dispatch<
    React.SetStateAction<StatusTypeForListType<T>[]>
  >;
} {
  const [selectedStatuses, setSelectedStatuses] = useState<
    StatusTypeForListType<T>[]
  >(defaultSelectedStatuses ?? statuses);

  useEffect(() => {
    if (defaultSelectedStatuses) {
      setSelectedStatuses(defaultSelectedStatuses);
    }
  }, [defaultSelectedStatuses]);

  return { selectedStatuses, setSelectedStatuses };
}

function StatusFilter<T extends ApplicationListType>({
  id,
  statuses,
  defaultSelectedStatuses,
  onChange,
  listType,
}: Readonly<StatusFilterProps<T>>): React.JSX.Element {
  const { t } = useTranslation();
  const { selectedStatuses, setSelectedStatuses } = useStatusFilter<T>({
    defaultSelectedStatuses,
    statuses,
  });

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
          setSelectedStatuses(nextStatuses);
          // Only update query if selection is valid (not empty) to avoid querying every status
          if (nextStatuses.length > 0) {
            onChange(nextStatuses);
          }
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
