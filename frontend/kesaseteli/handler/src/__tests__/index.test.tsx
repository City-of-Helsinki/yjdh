import { axe } from 'jest-axe';
import {
  expectToGetYouthApplication,
  expectToGetYouthApplicationError,
} from 'kesaseteli/handler/__tests__/utils/backend/backend-nocks';
import getIndexPageApi from 'kesaseteli/handler/__tests__/utils/components/get-index-page-api';
import renderPage from 'kesaseteli/handler/__tests__/utils/components/render-page';
import VTJ_EXCEPTIONS from 'kesaseteli/handler/constants/vtj-exceptions';
import HandlerIndex from 'kesaseteli/handler/pages';
import headerApi from 'kesaseteli-shared/__tests__/utils/component-apis/header-api';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import {
  fakeActivatedYouthApplication,
  fakeExpiredVtjAddress,
  fakeFutureVtjAddress,
  fakeSSN,
  fakeValidVtjAddress,
  fakeYouthTargetGroupAge,
  fakeYouthTargetGroupAgeSSN,
} from 'kesaseteli-shared/__tests__/utils/fake-objects';
import {
  YOUTH_APPLICATION_STATUS_COMPLETED,
  YOUTH_APPLICATION_STATUS_HANDLER_CANNOT_PROCEED,
  YOUTH_APPLICATION_STATUS_WAITING_FOR_HANDLER_ACTION,
} from 'kesaseteli-shared/constants/youth-application-status';
import React from 'react';
import { waitFor } from 'shared/__tests__/utils/test-utils';
import { DEFAULT_LANGUAGE } from 'shared/i18n/i18n';
import { convertToUIDateAndTimeFormat } from 'shared/utils/date.utils';

// eslint-disable-next-line sonarjs/cognitive-complexity
describe('frontend/kesaseteli/handler/src/pages/index.tsx', () => {
  it('should not violate accessibility', async () => {
    const {
      renderResult: { container },
    } = renderComponent(<HandlerIndex />, { query: {} });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it(`shows error toast when backend returns bad request`, async () => {
    expectToGetYouthApplicationError('123-abc', 400);
    await renderPage(HandlerIndex, { query: { id: '123-abc' } });
    await headerApi.expectations.errorToastIsShown();
  });

  it(`redirects to 500 -error page when backend returns unexpected error`, async () => {
    expectToGetYouthApplicationError('123-abc', 500);
    const spyPush = jest.fn();
    await renderPage(HandlerIndex, { push: spyPush, query: { id: '123-abc' } });
    await waitFor(() =>
      expect(spyPush).toHaveBeenCalledWith(`${DEFAULT_LANGUAGE}/500`)
    );
  });

  it(`shows that application is not found when id query param is not present`, async () => {
    await renderPage(HandlerIndex, { query: {} });
    const indexPageApi = await getIndexPageApi();
    await indexPageApi.expectations.applicationWasNotFound();
  });

  it(`shows that application is not found when backend returns 404`, async () => {
    expectToGetYouthApplicationError('123-abc', 404);
    await renderPage(HandlerIndex, { query: { id: '123-abc' } });
    const indexPageApi = await getIndexPageApi();
    await indexPageApi.expectations.applicationWasNotFound();
  });

  it(`shows youth application data`, async () => {
    const application = fakeActivatedYouthApplication();
    expectToGetYouthApplication(application);
    await renderPage(HandlerIndex, { query: { id: application.id } });
    const indexPageApi = await getIndexPageApi(application);
    await indexPageApi.expectations.pageIsLoaded();
    await indexPageApi.expectations.fieldValueIsPresent(
      'receipt_confirmed_at',
      convertToUIDateAndTimeFormat
    );
    await indexPageApi.expectations.nameIsPresent(application);
    await indexPageApi.expectations.fieldValueIsPresent(
      'social_security_number'
    );
    await indexPageApi.expectations.fieldValueIsPresent('postcode');
    await indexPageApi.expectations.fieldValueIsPresent('school');
    await indexPageApi.expectations.fieldValueIsPresent('phone_number');
    await indexPageApi.expectations.fieldValueIsPresent('email');
    indexPageApi.expectations.additionalInfoIsNotPresent();
  });

  it(`shows youth application data with unlisted school`, async () => {
    const application = fakeActivatedYouthApplication({
      is_unlisted_school: true,
    });
    expectToGetYouthApplication(application);
    await renderPage(HandlerIndex, {
      query: { id: application.id },
    });
    const indexPageApi = await getIndexPageApi(application);
    await indexPageApi.expectations.pageIsLoaded();
    await indexPageApi.expectations.fieldValueIsPresent(
      'school',
      (school) => `${school ?? ''} (Koulua ei löytynyt listalta)`
    );
  });

  it(`shows additional info fields`, async () => {
    const application = fakeActivatedYouthApplication({
      status: 'additional_information_provided',
    });
    expectToGetYouthApplication(application);
    await renderPage(HandlerIndex, {
      query: { id: application.id },
    });
    const indexPageApi = await getIndexPageApi(application);
    await indexPageApi.expectations.pageIsLoaded();
    await indexPageApi.expectations.additionalInfoIsPresent();
    await indexPageApi.expectations.fieldValueIsPresent(
      'additional_info_provided_at',
      convertToUIDateAndTimeFormat
    );
    await indexPageApi.expectations.additionalInfoReasonsAreShown();
    await indexPageApi.expectations.fieldValueIsPresent(
      'additional_info_description'
    );
  });

  describe('vtj data', () => {
    it(`shows vtjData without errors`, async () => {
      const { age, social_security_number } = fakeYouthTargetGroupAge();
      const application = fakeActivatedYouthApplication({
        social_security_number,
      });
      expectToGetYouthApplication(application);
      await renderPage(HandlerIndex, {
        query: { id: application.id },
      });
      const indexPageApi = await getIndexPageApi(application);
      await indexPageApi.expectations.pageIsLoaded();

      const { LahiosoiteS, PostitoimipaikkaS } =
        application.encrypted_handler_vtj_json.Henkilo
          .VakinainenKotimainenLahiosoite;

      await indexPageApi.expectations.vtjInfoIsPresent();
      await indexPageApi.expectations.vtjFieldValueIsPresent(
        'name',
        `${application.first_name} ${application.last_name}`
      );
      await indexPageApi.expectations.vtjFieldValueIsPresent(
        'ssn',
        application.social_security_number
      );
      await indexPageApi.expectations.vtjFieldValueIsPresent(
        'address',
        `${LahiosoiteS} ${application.postcode} ${PostitoimipaikkaS}`
      );
      for (const exception of VTJ_EXCEPTIONS) {
        await indexPageApi.expectations.vtjErrorMessageIsNotPresent(exception, {
          age,
          last_name: application.last_name,
          social_security_number,
          postcode: application.postcode,
        });
      }
    });

    it(`shows error when vtjData is not found`, async () => {
      const social_security_number = fakeYouthTargetGroupAgeSSN();
      const application = fakeActivatedYouthApplication({
        social_security_number,
        encrypted_handler_vtj_json: {
          Henkilo: { Henkilotunnus: { '@voimassaolokoodi': '0' } },
        },
      });
      expectToGetYouthApplication(application);
      await renderPage(HandlerIndex, {
        query: { id: application.id },
      });
      const indexPageApi = await getIndexPageApi(application);
      await indexPageApi.expectations.pageIsLoaded();

      await indexPageApi.expectations.vtjErrorMessageIsPresent('notFound', {
        social_security_number,
      });
    });

    it(`shows warning when vtjData has different last name`, async () => {
      const application = fakeActivatedYouthApplication({
        last_name: 'Nieminen',
        encrypted_handler_vtj_json: {
          Henkilo: { NykyinenSukunimi: { Sukunimi: 'Virtanen' } },
        },
      });
      expectToGetYouthApplication(application);
      await renderPage(HandlerIndex, {
        query: { id: application.id },
      });
      const indexPageApi = await getIndexPageApi(application);
      await indexPageApi.expectations.pageIsLoaded();

      await indexPageApi.expectations.vtjErrorMessageIsPresent(
        'differentLastName',
        { last_name: 'Nieminen' }
      );
    });

    for (const age of [2, 15, 16, 17, 18, 110]) {
      const classYear = new Date().getFullYear() - age;
      it(`shows warning when applicant is not in target age group, age: ${age}`, async () => {
        const application = fakeActivatedYouthApplication({
          social_security_number: fakeSSN(classYear),
        });
        expectToGetYouthApplication(application);
        await renderPage(HandlerIndex, {
          query: { id: application.id },
        });
        const indexPageApi = await getIndexPageApi(application);
        await indexPageApi.expectations.pageIsLoaded();
        // eslint-disable-next-line unicorn/prefer-ternary
        if ([16, 17].includes(age)) {
          await indexPageApi.expectations.vtjErrorMessageIsNotPresent(
            'notInTargetAgeGroup',
            { age }
          );
        } else {
          await indexPageApi.expectations.vtjErrorMessageIsPresent(
            'notInTargetAgeGroup',
            { age }
          );
        }
      });
    }

    it(`shows permanent address over temporary address`, async () => {
      const permanentAddress = fakeValidVtjAddress();
      const temporaryAddress = fakeValidVtjAddress();
      const application = fakeActivatedYouthApplication({
        encrypted_handler_vtj_json: {
          Henkilo: {
            VakinainenKotimainenLahiosoite: permanentAddress,
            TilapainenKotimainenLahiosoite: temporaryAddress,
          },
        },
      });
      expectToGetYouthApplication(application);
      await renderPage(HandlerIndex, {
        query: { id: application.id },
      });
      const indexPageApi = await getIndexPageApi(application);
      await indexPageApi.expectations.pageIsLoaded();

      const { LahiosoiteS, Postinumero, PostitoimipaikkaS } = permanentAddress;
      await indexPageApi.expectations.vtjFieldValueIsPresent(
        'address',
        `${LahiosoiteS} ${Postinumero} ${PostitoimipaikkaS}`
      );
    });
    it(`shows temporary address when permanent address has expired`, async () => {
      const permanentAddress = fakeExpiredVtjAddress();
      const temporaryAddress = fakeValidVtjAddress();
      const application = fakeActivatedYouthApplication({
        encrypted_handler_vtj_json: {
          Henkilo: {
            VakinainenKotimainenLahiosoite: permanentAddress,
            TilapainenKotimainenLahiosoite: temporaryAddress,
          },
        },
      });
      expectToGetYouthApplication(application);
      await renderPage(HandlerIndex, {
        query: { id: application.id },
      });
      const indexPageApi = await getIndexPageApi(application);
      await indexPageApi.expectations.pageIsLoaded();

      const { LahiosoiteS, Postinumero, PostitoimipaikkaS } = temporaryAddress;
      await indexPageApi.expectations.vtjFieldValueIsPresent(
        'address',
        `${LahiosoiteS} ${Postinumero} ${PostitoimipaikkaS}`
      );
    });

    it(`shows 'address not found' -error when both addresses are currently invalid`, async () => {
      const application = fakeActivatedYouthApplication({
        encrypted_handler_vtj_json: {
          Henkilo: {
            VakinainenKotimainenLahiosoite: fakeExpiredVtjAddress(),
            TilapainenKotimainenLahiosoite: fakeFutureVtjAddress(),
          },
        },
      });
      expectToGetYouthApplication(application);
      await renderPage(HandlerIndex, {
        query: { id: application.id },
      });
      const indexPageApi = await getIndexPageApi(application);
      await indexPageApi.expectations.pageIsLoaded();
      await indexPageApi.expectations.vtjErrorMessageIsPresent(
        'addressNotFound'
      );
    });

    it(`shows 'different postcode' -error when application has different post code`, async () => {
      const application = fakeActivatedYouthApplication({
        postcode: '00100',
        encrypted_handler_vtj_json: {
          Henkilo: { VakinainenKotimainenLahiosoite: { Postinumero: '00540' } },
        },
      });
      expectToGetYouthApplication(application);
      await renderPage(HandlerIndex, {
        query: { id: application.id },
      });
      const indexPageApi = await getIndexPageApi(application);
      await indexPageApi.expectations.pageIsLoaded();
      await indexPageApi.expectations.vtjErrorMessageIsPresent(
        'differentPostCode',
        { postcode: '00100' }
      );
    });

    it(`doesn't show 'different postcode' -error when application has same post code`, async () => {
      const application = fakeActivatedYouthApplication({
        postcode: '00100',
        encrypted_handler_vtj_json: {
          Henkilo: { VakinainenKotimainenLahiosoite: { Postinumero: '00100' } },
        },
      });
      expectToGetYouthApplication(application);
      await renderPage(HandlerIndex, {
        query: { id: application.id },
      });
      const indexPageApi = await getIndexPageApi(application);
      await indexPageApi.expectations.pageIsLoaded();
      await indexPageApi.expectations.vtjErrorMessageIsNotPresent(
        'differentPostCode',
        { postcode: '00100' }
      );
    });

    it(`shows 'outside Helsinki' -error when city is not Helsinki`, async () => {
      const application = fakeActivatedYouthApplication({
        encrypted_handler_vtj_json: {
          Henkilo: {
            VakinainenKotimainenLahiosoite: { PostitoimipaikkaS: 'Vaasa' },
          },
        },
      });
      expectToGetYouthApplication(application);
      await renderPage(HandlerIndex, {
        query: { id: application.id },
      });
      const indexPageApi = await getIndexPageApi(application);
      await indexPageApi.expectations.pageIsLoaded();
      await indexPageApi.expectations.vtjErrorMessageIsPresent(
        'outsideHelsinki'
      );
    });

    it(`doesn't show 'outside Helsinki' -error when city is Helsinki`, async () => {
      const application = fakeActivatedYouthApplication({
        encrypted_handler_vtj_json: {
          Henkilo: {
            VakinainenKotimainenLahiosoite: { PostitoimipaikkaS: 'Helsinki' },
          },
        },
      });
      expectToGetYouthApplication(application);
      await renderPage(HandlerIndex, {
        query: { id: application.id },
      });
      const indexPageApi = await getIndexPageApi(application);
      await indexPageApi.expectations.pageIsLoaded();
      await indexPageApi.expectations.vtjErrorMessageIsNotPresent(
        'outsideHelsinki'
      );
    });

    it(`shows 'is dead' -error when applicant has died`, async () => {
      const application = fakeActivatedYouthApplication({
        encrypted_handler_vtj_json: {
          Henkilo: { Kuolintiedot: { Kuollut: '1' } },
        },
      });
      expectToGetYouthApplication(application);
      await renderPage(HandlerIndex, {
        query: { id: application.id },
      });
      const indexPageApi = await getIndexPageApi(application);
      await indexPageApi.expectations.pageIsLoaded();
      await indexPageApi.expectations.vtjErrorMessageIsPresent('isDead');
    });

    for (const status of YOUTH_APPLICATION_STATUS_WAITING_FOR_HANDLER_ACTION) {
      describe(`when application status is "${status}"`, () => {
        it('shows accept and reject buttons', async () => {
          const application = fakeActivatedYouthApplication({ status });
          expectToGetYouthApplication(application);
          await renderPage(HandlerIndex, {
            query: { id: application.id },
          });
          const indexPageApi = await getIndexPageApi(application);
          await indexPageApi.expectations.pageIsLoaded();
          await indexPageApi.expectations.actionButtonsArePresent();
        });
      });
    }
  });
  for (const status of YOUTH_APPLICATION_STATUS_HANDLER_CANNOT_PROCEED) {
    describe(`when application status is "${status}"`, () => {
      it('shows notification message and buttons are not present', async () => {
        const application = fakeActivatedYouthApplication({ status });
        expectToGetYouthApplication(application);
        await renderPage(HandlerIndex, {
          query: { id: application.id },
        });
        const indexPageApi = await getIndexPageApi(application);
        await indexPageApi.expectations.pageIsLoaded();
        indexPageApi.expectations.actionButtonsAreNotPresent();
        await indexPageApi.expectations.statusNotificationIsPresent(status);
      });
    });
  }
  for (const status of YOUTH_APPLICATION_STATUS_COMPLETED) {
    const operationType = status === 'accepted' ? 'accept' : 'reject';
    describe(`when clicking cancel-button on ${operationType}-confirmation dialog`, () => {
      it(`cancels the operation ${operationType}`, async () => {
        const application = fakeActivatedYouthApplication({
          status: 'awaiting_manual_processing',
        });
        expectToGetYouthApplication(application);
        await renderPage(HandlerIndex, {
          query: { id: application.id },
        });
        const indexPageApi = await getIndexPageApi(application);
        await indexPageApi.expectations.actionButtonsArePresent();
        await indexPageApi.actions.clickCompleteButton(operationType);
        await indexPageApi.expectations.showsConfirmDialog(operationType);
        await indexPageApi.actions.clickCancelButton();
        await indexPageApi.expectations.actionButtonsArePresent();
      });
    });
    describe(`when clicking confirm button on ${operationType}-confirmation dialog`, () => {
      it(`shows a message that application is ${status}`, async () => {
        const application = fakeActivatedYouthApplication({
          status: 'awaiting_manual_processing',
        });
        expectToGetYouthApplication(application);
        await renderPage(HandlerIndex, {
          query: { id: application.id },
        });
        const indexPageApi = await getIndexPageApi(application);
        await indexPageApi.expectations.actionButtonsArePresent();
        await indexPageApi.actions.clickCompleteButton(operationType);
        await indexPageApi.expectations.showsConfirmDialog(operationType);
        await indexPageApi.actions.clickConfirmButton(operationType);
        await indexPageApi.expectations.statusNotificationIsPresent(status);
      });

      it(`shows error toast when backend returns bad request`, async () => {
        const application = fakeActivatedYouthApplication({
          status: 'awaiting_manual_processing',
        });
        expectToGetYouthApplication(application);
        await renderPage(HandlerIndex, {
          query: { id: application.id },
        });
        const indexPageApi = await getIndexPageApi(application);
        await indexPageApi.expectations.actionButtonsArePresent();
        await indexPageApi.actions.clickCompleteButton(operationType);
        await indexPageApi.expectations.showsConfirmDialog(operationType);
        await indexPageApi.actions.clickConfirmButton(operationType, 400);
        await headerApi.expectations.errorToastIsShown();
      });

      it(`redirects to 500 -error page when backend returns unexpected error`, async () => {
        const application = fakeActivatedYouthApplication({
          status: 'awaiting_manual_processing',
        });
        expectToGetYouthApplication(application);
        const spyPush = jest.fn();
        await renderPage(HandlerIndex, {
          push: spyPush,
          query: { id: application.id },
        });
        const indexPageApi = await getIndexPageApi(application);
        await indexPageApi.expectations.actionButtonsArePresent();
        await indexPageApi.actions.clickCompleteButton(operationType);
        await indexPageApi.expectations.showsConfirmDialog(operationType);
        await indexPageApi.actions.clickConfirmButton(operationType, 500);
        await waitFor(() =>
          expect(spyPush).toHaveBeenCalledWith(`${DEFAULT_LANGUAGE}/500`)
        );
      });
    });
  }
});
