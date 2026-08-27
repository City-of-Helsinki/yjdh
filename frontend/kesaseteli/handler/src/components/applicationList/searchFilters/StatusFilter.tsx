import { Select } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React, { useEffect, useMemo, useState } from 'react';
import FieldErrorMessage from 'shared/components/forms/fields/fieldErrorMessage/FieldErrorMessage';
import { OptionType } from 'shared/types/common';
import styled from 'styled-components';

const $Wrapper = styled.div`
  margin-bottom: 1rem;
`;

type StatusFilterProps<StatusType> = {
  id: string;
  statuses: StatusType[];
  defaultSelectedStatuses?: StatusType[];
  onChange: (statuses: StatusType[]) => void;
};

type UseStatusFilterProps<StatusType> = {
  defaultSelectedStatuses?: StatusType[];
  statuses: StatusType[];
};

export function useStatusFilter<StatusType>({
  defaultSelectedStatuses,
  statuses,
}: UseStatusFilterProps<StatusType>): {
  selectedStatuses: StatusType[];
  setSelectedStatuses: React.Dispatch<
    React.SetStateAction<StatusType[]>
  >;
} {
  const [selectedStatuses, setSelectedStatuses] = useState<StatusType[]>(
    defaultSelectedStatuses ?? statuses
  );

  useEffect(() => {
    if (defaultSelectedStatuses) {
      setSelectedStatuses(defaultSelectedStatuses);
    }
  }, [defaultSelectedStatuses]);

  return { selectedStatuses, setSelectedStatuses };
};

function StatusFilter<StatusType extends string>({
  id,
  statuses,
  defaultSelectedStatuses,
  onChange,
}: StatusFilterProps<StatusType>): JSX.Element {
  const { t } = useTranslation();
  const { selectedStatuses, setSelectedStatuses } = useStatusFilter({
    defaultSelectedStatuses,
    statuses,
  });

  const options = useMemo<OptionType<StatusType>[]>(
    () =>
      statuses.map((status) => ({
        label: t(`common:applicationList.status.${status}`),
        value: status,
      })),
    [statuses, t]
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
            (option) => option.value as StatusType
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
};

export default StatusFilter;
