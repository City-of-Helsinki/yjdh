import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import { useMutation, UseMutationResult, useQueryClient } from 'react-query';
import useBackendAPI from 'shared/hooks/useBackendAPI';

const useDeleteApplicationQuery = (): UseMutationResult<
    void,
    unknown,
    string
> => {
    const { axios, handleResponse } = useBackendAPI();
    const queryClient = useQueryClient();
    return useMutation(
        BackendEndpoint.EMPLOYER_APPLICATIONS,
        (id: string) =>
            handleResponse<void>(
                axios.delete(`${BackendEndpoint.EMPLOYER_APPLICATIONS}${id}/`)
            ),
        {
            onSuccess: () => {
                void queryClient.invalidateQueries(BackendEndpoint.EMPLOYER_APPLICATIONS);
            },
        }
    );
};

export default useDeleteApplicationQuery;
