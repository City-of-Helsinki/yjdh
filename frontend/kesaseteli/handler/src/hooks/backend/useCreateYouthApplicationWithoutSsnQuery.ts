import type {
  ApplicationWithoutSsnFormData,
  BackendApplicationWithoutSsn,
} from 'kesaseteli/handler/types/application-without-ssn-types';
import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import CreatedYouthApplication from 'kesaseteli-shared/types/created-youth-application';
import { useMutation, UseMutationResult } from 'react-query';
import useBackendAPI from 'shared/hooks/useBackendAPI';

const useCreateYouthApplicationWithoutSsnQuery = (): UseMutationResult<
  CreatedYouthApplication,
  unknown,
  ApplicationWithoutSsnFormData
> => {
  const { axios, handleResponse } = useBackendAPI();

  const toBackendFormData = (
    formData: ApplicationWithoutSsnFormData
  ): BackendApplicationWithoutSsn => ({
    first_name: formData.firstName,
    last_name: formData.lastName,
    email: formData.email,
    school: formData.school,
    phone_number: formData.phoneNumber,
    postcode: formData.postcode,
    language: formData.language,
    non_vtj_birthdate: formData.nonVtjBirthdate,
    non_vtj_home_municipality: formData.nonVtjHomeMunicipality,
    additional_info_description: formData.additionalInfoDescription,
  });

  return useMutation(
    BackendEndpoint.CREATE_YOUTH_APPLICATION_WITHOUT_SSN,
    (formData) =>
      handleResponse<CreatedYouthApplication>(
        axios.post(
          BackendEndpoint.CREATE_YOUTH_APPLICATION_WITHOUT_SSN,
          toBackendFormData(formData)
        )
      )
  );
};

export default useCreateYouthApplicationWithoutSsnQuery;
