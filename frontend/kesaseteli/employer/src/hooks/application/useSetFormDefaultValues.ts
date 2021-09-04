import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import merge from 'lodash/merge';
import React from 'react'
import { UseFormReturn} from 'react-hook-form'
import Application from 'shared/types/employer-application';

const useSetFormDefaultValues = ({ reset, getValues }: UseFormReturn<Application>) : void  => {

  const {application, isLoading} = useApplicationApi();

  // https://github.com/react-hook-form/react-hook-form/issues/2492
  React.useEffect(() => {
    if (!application || isLoading) {
      return;
    }
    reset(merge(
      {...application},
      getValues(),
    ));
  }, [reset, application, getValues, isLoading]);

}
export default useSetFormDefaultValues;
