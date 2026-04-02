import {
  expectToGetSchoolsFromBackend,
  expectToGetSummerVoucherConfigurationFromBackend,
  expectToReplyValidationErrorWhenCreatingYouthApplication,
} from 'kesaseteli/youth/__tests__/utils/backend/backend-nocks';
import getIndexPageApi from 'kesaseteli/youth/__tests__/utils/components/get-index-page-api';
import renderPage from 'kesaseteli/youth/__tests__/utils/components/render-page';
import YouthIndex from 'kesaseteli/youth/pages';
import { fakeBackendValidationErrorResponse } from 'kesaseteli-shared/__tests__/utils/fake-objects';
import YOUTH_FORM_FIELDS from 'kesaseteli-shared/constants/youth-form-fields';
import YouthFormFields from 'kesaseteli-shared/types/youth-form-fields';
import { collectErrorFieldsFromResponse } from 'kesaseteli-shared/utils/youth-form-data.utils';
import { difference } from 'shared/utils/array.utils';

describe('frontend/kesaseteli/youth/src/pages/index.tsx', () => {
  describe('when application is open', () => {
    beforeEach(() => {
      expectToGetSummerVoucherConfigurationFromBackend();
    });

    describe('validating application', () => {
      it('shows required validation errors', async () => {
        expectToGetSchoolsFromBackend();
        renderPage(YouthIndex);
        const indexPageApi = getIndexPageApi();
        await indexPageApi.expectations.pageIsLoaded();
        await indexPageApi.actions.clickSaveButton();

        await Promise.all([
          indexPageApi.expectations.textInputHasError('first_name', 'required'),
          indexPageApi.expectations.textInputHasError('last_name', 'required'),
          indexPageApi.expectations.textInputHasError(
            'social_security_number',
            'required'
          ),
          indexPageApi.expectations.selectedSchoolHasError('required'),
          indexPageApi.expectations.textInputHasError('email', 'required'),
          indexPageApi.expectations.textInputHasError(
            'phone_number',
            'required'
          ),
          indexPageApi.expectations.targetGroupHasError('required'),
          indexPageApi.expectations.checkboxHasError(
            'termsAndConditions',
            'required'
          ),
        ]);
      });

      it('shows min length too short validation errors', async () => {
        expectToGetSchoolsFromBackend();
        renderPage(YouthIndex);
        const indexPageApi = getIndexPageApi();
        await indexPageApi.expectations.pageIsLoaded();
        await indexPageApi.actions.typeInput('postcode', '0123'); // min limit is 5
        await indexPageApi.actions.clickSaveButton();

        await indexPageApi.expectations.textInputHasError(
          'postcode',
          'minLength'
        );
      });

      it('shows max length exceeded validation errors', async () => {
        expectToGetSchoolsFromBackend();
        renderPage(YouthIndex);
        const indexPageApi = getIndexPageApi();
        await indexPageApi.expectations.pageIsLoaded();

        await indexPageApi.actions.typeInput('first_name', 'a'.repeat(129)); // max limit is 128
        await indexPageApi.actions.typeInput('last_name', 'a'.repeat(129)); // max limit is 128
        await indexPageApi.actions.typeInput('postcode', '123456'); // max limit is 5
        await indexPageApi.actions.typeInput('phone_number', 'a'.repeat(65)); // max limit is 254
        await indexPageApi.actions.typeInput('email', 'a'.repeat(255)); // max limit is 254
        await indexPageApi.actions.clickSaveButton();

        await Promise.all([
          indexPageApi.expectations.textInputHasError(
            'first_name',
            'maxLength'
          ),
          indexPageApi.expectations.textInputHasError('last_name', 'maxLength'),
          indexPageApi.expectations.textInputHasError('postcode', 'maxLength'),
          indexPageApi.expectations.textInputHasError(
            'phone_number',
            'maxLength'
          ),
          indexPageApi.expectations.textInputHasError('email', 'maxLength'),
        ]);
      });

      it('shows invalid format errors', async () => {
        expectToGetSchoolsFromBackend();
        renderPage(YouthIndex);
        const indexPageApi = getIndexPageApi();
        await indexPageApi.expectations.pageIsLoaded();

        await indexPageApi.actions.typeInput(
          'first_name',
          ' leading whitespace'
        );
        await indexPageApi.actions.typeInput(
          'last_name',
          '\tleading whitespace'
        );
        // Note! 170915-915L is a fake ssn. See more info (in finnish only):
        // https://www.tuomas.salste.net/doc/tunnus/henkilotunnus.html#keinotunnus
        await indexPageApi.actions.typeInput(
          'social_security_number',
          '170915-915L'
        );
        await indexPageApi.actions.typeInput('postcode', 'abcde');
        await indexPageApi.actions.typeInput(
          'phone_number',
          '+44-20-7011-5555'
        );
        await indexPageApi.actions.typeInput('email', 'aaaa@bbb');
        await indexPageApi.actions.clickSaveButton();

        await Promise.all([
          indexPageApi.expectations.textInputHasError('first_name', 'pattern'),
          indexPageApi.expectations.textInputHasError('last_name', 'pattern'),
          indexPageApi.expectations.textInputHasError('postcode', 'pattern'),
          indexPageApi.expectations.textInputHasError(
            'social_security_number',
            'pattern'
          ),
          indexPageApi.expectations.textInputHasError(
            'phone_number',
            'pattern'
          ),
          indexPageApi.expectations.textInputHasError('email', 'pattern'),
        ]);
      });
      it('shows error messages for unlisted school', async () => {
        expectToGetSchoolsFromBackend();
        renderPage(YouthIndex);
        const indexPageApi = getIndexPageApi();
        await indexPageApi.expectations.pageIsLoaded();
        await indexPageApi.expectations.inputIsNotPresent('unlistedSchool');
        await indexPageApi.actions.clickSaveButton();
        await indexPageApi.expectations.selectedSchoolHasError('required');
        await indexPageApi.actions.toggleCheckbox('is_unlisted_school');
        await indexPageApi.expectations.selectedSchoolIsDisabled();
        await indexPageApi.expectations.selectedSchoolIsValid();
        await indexPageApi.expectations.inputIsPresent('unlistedSchool');
        await indexPageApi.actions.clickSaveButton();
        await indexPageApi.expectations.textInputHasError(
          'unlistedSchool',
          'required'
        );

        await indexPageApi.actions.typeInput('unlistedSchool', 'a'.repeat(257)); // max limit is 257
        await indexPageApi.expectations.textInputHasError(
          'unlistedSchool',
          'maxLength'
        );

        await indexPageApi.actions.typeInput('unlistedSchool', ' ');
        await indexPageApi.expectations.textInputHasError(
          'unlistedSchool',
          'pattern'
        );

        await indexPageApi.actions.toggleCheckbox('is_unlisted_school');
        await indexPageApi.expectations.selectedSchoolIsEnabled();

        await indexPageApi.actions.clickSaveButton();
        await indexPageApi.expectations.selectedSchoolHasError('required');
        await indexPageApi.expectations.inputIsNotPresent('unlistedSchool');
      });
    });

    describe('when backend returns validation error', () => {
      it('shows validation error notification and invalid field names (with listed school)', async () => {
        expectToGetSchoolsFromBackend();
        renderPage(YouthIndex);
        const indexPageApi = getIndexPageApi();
        await indexPageApi.expectations.pageIsLoaded();
        const randomValidationError = fakeBackendValidationErrorResponse();
        const invalidFields = collectErrorFieldsFromResponse(
          randomValidationError,
          false
        );
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        const validFields = difference(YOUTH_FORM_FIELDS, [
          ...invalidFields,
          'unlistedSchool',
        ]) as YouthFormFields[];
        await indexPageApi.actions.fillTheFormWithListedSchoolAndSave({
          backendExpectation:
            expectToReplyValidationErrorWhenCreatingYouthApplication(
              randomValidationError
            ),
        });
        await indexPageApi.expectations.validationErrorNotificationIsPresent(
          invalidFields
        );

        await Promise.all(
          invalidFields.map(async (field) => {
            if (field === 'selectedSchool') {
              return indexPageApi.expectations.selectedSchoolHasError(
                'pattern'
              );
            }
            if (
              field === 'termsAndConditions' ||
              field === 'is_unlisted_school'
            ) {
              return indexPageApi.expectations.checkboxHasError(
                field,
                'pattern'
              );
            }
            if (field === 'target_group') {
              return indexPageApi.expectations.targetGroupHasError('pattern');
            }
            return indexPageApi.expectations.textInputHasError(
              field,
              'pattern'
            );
          })
        );

        await Promise.all(
          validFields.map(async (field) => indexPageApi.expectations.textInputIsValid(field))
        );
      });
      it('shows invalid unlisted school field when unlistedSchool in the error repsonse', async () => {
        expectToGetSchoolsFromBackend();
        renderPage(YouthIndex);
        const indexPageApi = getIndexPageApi();
        await indexPageApi.expectations.pageIsLoaded();
        const unlistedSchoolValidationError = {
          unlistedSchool: ['is invalid'],
        };
        await indexPageApi.actions.fillTheFormWithUnlistedSchoolAndSave({
          backendExpectation:
            expectToReplyValidationErrorWhenCreatingYouthApplication(
              unlistedSchoolValidationError
            ),
        });
        await indexPageApi.expectations.validationErrorNotificationIsPresent([
          'unlistedSchool',
        ]);
        await indexPageApi.expectations.textInputHasError(
          'unlistedSchool',
          'pattern'
        );
      });
    });
  });
});
