import { Button, ButtonProps } from 'hds-react';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { UseMutationResult } from 'react-query';

type Props<FormData, BackendResponseData> = Omit<ButtonProps, 'onClick'> & {
  saveQuery: UseMutationResult<BackendResponseData, Error, FormData>;
  onSuccess: (response: BackendResponseData) => void | Promise<void>;
};

const SaveFormButton = <
  FormData extends Record<string, unknown>,
  BackendResponseData = void
>({
  saveQuery,
  onSuccess,
  children,
  disabled,
  isLoading,
  theme,
  ...buttonProps
}: Props<FormData, BackendResponseData>): React.ReactElement => {
  const { getValues, handleSubmit, formState } = useFormContext<FormData>();

  const isSaving = React.useMemo(
    () => saveQuery.isLoading || formState.isSubmitting,
    [saveQuery.isLoading, formState.isSubmitting]
  );
  const handleSaving = React.useCallback(() => {
    saveQuery.mutate(getValues(), {
      onSuccess: (responseData) => {
        if (onSuccess) {
          void onSuccess(responseData);
        }
      },
    });
  }, [saveQuery, getValues, onSuccess]);

  return (
    <Button
      {...buttonProps}
      theme={theme || 'coat'}
      onClick={handleSubmit(handleSaving)}
      disabled={disabled || isSaving}
      isLoading={isLoading || isSaving}
    >
      {children}
    </Button>
  );
};

export default SaveFormButton;
