import { Button, CommonButtonProps } from 'hds-react';
import noop from 'lodash/noop';
import React from 'react';
import {
  SubmitErrorHandler,
  SubmitHandler,
  useFormContext,
} from 'react-hook-form';
import { UseMutationResult } from 'react-query';
import useErrorHandler from 'shared/hooks/useErrorHandler';

type Props<FormData, BackendResponseData> = Omit<
  CommonButtonProps,
  'onClick' | 'onError'
> & {
  saveQuery: UseMutationResult<BackendResponseData, unknown, FormData>;
  onSuccess: (response: BackendResponseData) => void | Promise<void>;
  onError?: (error: Error | unknown) => void;
  onInvalidForm?: SubmitErrorHandler<FormData>;
};

const SaveFormButton = <
  FormData extends Record<string, unknown>,
  BackendResponseData = void
>({
  saveQuery,
  onSuccess,
  onError,
  onInvalidForm,
  children,
  disabled,
  isLoading,
  theme,
  ...buttonProps
}: Props<FormData, BackendResponseData>): React.ReactElement => {
  const { handleSubmit, formState } = useFormContext<FormData>();

  const onDefaultError = useErrorHandler(false);

  const isSaving = React.useMemo(
    () => saveQuery.isLoading || formState.isSubmitting,
    [saveQuery.isLoading, formState.isSubmitting]
  );
  const handleSaving: SubmitHandler<FormData> = React.useCallback(
    (formData) => {
      saveQuery.mutate(formData as FormData, {
        onSuccess: (responseData) => {
          if (onSuccess) {
            void onSuccess(responseData);
          }
        },
        onError: onError ?? onDefaultError,
      });
    },
    [saveQuery, onSuccess, onError]
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
  onError: undefined,
};

export default SaveFormButton;
