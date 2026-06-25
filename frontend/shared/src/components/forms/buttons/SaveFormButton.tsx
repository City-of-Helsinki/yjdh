import { UseMutationResult } from '@tanstack/react-query';
import { ButtonPresetTheme, ButtonVariant } from 'hds-react';
import React from 'react';
import {
  FieldValues,
  SubmitErrorHandler,
  SubmitHandler,
  useFormContext,
} from 'react-hook-form';
import Button from 'shared/components/button/Button';
import LinkButton from 'shared/components/link-button/LinkButton';
import useErrorHandler from 'shared/hooks/useErrorHandler';

type Props<FormData extends FieldValues, BackendResponseData> = Omit<
  React.ComponentProps<typeof Button>,
  'onClick' | 'onError'
> & {
  saveQuery: UseMutationResult<BackendResponseData, unknown, FormData>;
  onSuccess?: (response: BackendResponseData) => void | Promise<void>;
  onError?: (error: Error | unknown) => void;
  onInvalidForm?: SubmitErrorHandler<FormData>;
  asLink?: boolean;
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
  asLink,
  variant = ButtonVariant.Primary,
  ...buttonProps
}: Props<FormData, BackendResponseData>): React.ReactElement => {
  const { handleSubmit, formState } = useFormContext<FormData>();

  const onDefaultError = useErrorHandler();

  const isSaving = React.useMemo(
    () => saveQuery.isPending || formState.isSubmitting,
    [saveQuery.isPending, formState.isSubmitting]
  );
  const handleSaving: SubmitHandler<FormData> = React.useCallback(
    (formData) => {
      saveQuery.mutate(formData, {
        onSuccess: (responseData) => {
          if (onSuccess) {
            void onSuccess(responseData);
          }
        },
        onError: onError ?? onDefaultError,
      });
    },
    [saveQuery, onError, onDefaultError, onSuccess]
  );
  const ButtonComponent = asLink ? LinkButton : Button;

  return (
    <ButtonComponent
      {...buttonProps}
      theme={theme || ButtonPresetTheme.Coat}
      onClick={handleSubmit(handleSaving, onInvalidForm)}
      disabled={disabled || isSaving}
      isLoading={isLoading || isSaving}
      variant={variant}
    >
      {children}
    </ButtonComponent>
  );
};

export default SaveFormButton;
