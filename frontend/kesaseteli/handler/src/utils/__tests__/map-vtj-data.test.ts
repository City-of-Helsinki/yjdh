import VtjException from 'kesaseteli/handler/constants/vtj-exception';
import { getVtjException } from 'kesaseteli/handler/utils/map-vtj-data';
import { fakeActivatedYouthApplication } from 'kesaseteli-shared/__tests__/utils/fake-objects';

describe('getVtjException', () => {
  it('returns undefined if application has valid VTJ data', () => {
    const application = fakeActivatedYouthApplication({
      social_security_number: '010101-123A',
      encrypted_handler_vtj_json: {
        Henkilo: {
          Henkilotunnus: {
            '@voimassaolokoodi': '1',
          },
        },
      },
    });

    expect(getVtjException(application)).toBeUndefined();
  });

  it('returns MISSING_SSN if social_security_number is missing', () => {
    const application = fakeActivatedYouthApplication({});
    application.social_security_number = '';

    expect(getVtjException(application)).toBe(VtjException.MISSING_SSN);
  });

  it('returns NOT_FOUND if encrypted_handler_vtj_json is missing or invalid', () => {
    const application = fakeActivatedYouthApplication({
      social_security_number: '010101-123A',
    });
    (
      application as unknown as { encrypted_handler_vtj_json: unknown }
    ).encrypted_handler_vtj_json = undefined;

    expect(getVtjException(application)).toBe(VtjException.NOT_FOUND);
  });

  it('returns NOT_FOUND if voimassaolokoodi is not 1', () => {
    const application = fakeActivatedYouthApplication({
      social_security_number: '010101-123A',
      encrypted_handler_vtj_json: {
        Henkilo: {
          Henkilotunnus: {
            '@voimassaolokoodi': '0',
          },
        },
      },
    });

    expect(getVtjException(application)).toBe(VtjException.NOT_FOUND);
  });

  it('returns IS_DEAD if Kuollut is 1', () => {
    const application = fakeActivatedYouthApplication({
      social_security_number: '010101-123A',
      encrypted_handler_vtj_json: {
        Henkilo: {
          Henkilotunnus: {
            '@voimassaolokoodi': '1',
          },
          Kuolintiedot: {
            Kuollut: '1',
          },
        },
      },
    });

    expect(getVtjException(application)).toBe(VtjException.IS_DEAD);
  });
});
