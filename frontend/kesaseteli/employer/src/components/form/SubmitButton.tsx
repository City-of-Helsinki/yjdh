import { Button, IconArrowRight } from 'hds-react';
import { getApplicationFormContext } from 'kesaseteli/employer/components/form/ApplicationForm';
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
  const { handleSubmit, isLoading, formState: { isSubmitting, isValid } } = React.useContext(
    getApplicationFormContext()
  );

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
