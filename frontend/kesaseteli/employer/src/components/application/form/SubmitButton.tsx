import { Button, IconArrowRight } from 'hds-react';
import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import useApplicationForm from 'kesaseteli/employer/hooks/application/useApplicationForm';
import React from 'react';
import Application from 'shared/types/employer-application';

type Props = {
  id: string;
  onSubmit: (application: Application) => void;
  loadingText: string;
  children: React.ReactNode;
};

const SubmitButton = ({
  id,
  loadingText,
  onSubmit,
  children,
}: Props): ReturnType<typeof Button> => {
  const {
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = useApplicationForm();
  const { isLoading } = useApplicationApi();

  return (
    <Button
      data-testid={id}
      iconRight={<IconArrowRight />}
      onClick={handleSubmit(onSubmit)}
      loadingText={loadingText}
      isLoading={isLoading}
      disabled={!isValid || isSubmitting}
    >
      {children}
    </Button>
  );
};

export default SubmitButton;
