import { Button, CommonButtonProps } from 'hds-react';
import noop from 'lodash/noop';
import React from 'react';
import { SubmitErrorHandler, useFormContext } from 'react-hook-form';
import { UseMutationResult } from 'react-query';

type Props<FormData, BackendResponseData> = Omit<
  CommonButtonProps,
  'onClick'
> & {
  saveQuery: UseMutationResult<BackendResponseData, Error, FormData>;
  onSuccess: (response: BackendResponseData) => void | Promise<void>;
  onInvalidForm?: SubmitErrorHandler<FormData>;
};

const SaveFormButton = <
  FormData extends Record<string, unknown>,
  BackendResponseData = void
>({
  saveQuery,
  onSuccess,
  onInvalidForm,
  children,
  disabled,
  isLoading,
  theme,
  ...buttonProps
}: Props<FormData, BackendResponseData>): React.ReactElement => {
  const { handleSubmit, formState } = useFormContext<FormData>();

  const isSaving = React.useMemo(
    () => saveQuery.isLoading || formState.isSubmitting,
    [saveQuery.isLoading, formState.isSubmitting]
  );
  const handleSaving = React.useCallback(
    (formData) => {
      saveQuery.mutate(formData, {
        onSuccess: (responseData) => {
          if (onSuccess) {
            void onSuccess(responseData);
          }
        },
      });
    },
    [saveQuery, onSuccess]
  );

  return (
    <Button
      {...buttonProps}
      theme={theme || 'coat'}
      onClick={handleSubmit(handleSaving, onInvalidForm)}
      disabled={disabled || isSaving}
      isLoading={isLoading || isSaving}
    >
      {children}
    </Button>
  );
};

SaveFormButton.defaultProps = {
  onInvalidForm: noop,
};

export default SaveFormButton;
