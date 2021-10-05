import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import React from 'react'
import { UseFormReturn} from 'react-hook-form'
import Application from 'shared/types/employer-application';


const useResetApplicationFormValues = ({ reset }: UseFormReturn<Application>) : void  => {

  const {application, isLoading} = useApplicationApi();
  React.useEffect(() => {
    if (!application || isLoading) {
      return;
    }
    reset(application);
  }, [reset, application, isLoading]);

}
export default useResetApplicationFormValues;
