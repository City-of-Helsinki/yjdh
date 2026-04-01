import {
  getInstalmentTagStyleForStatus,
  getTagStyleForStatus,
  getTalpaTagStyleForStatus,
} from 'benefit/handler/utils/applications';
import {
  APPLICATION_STATUSES,
  INSTALMENT_STATUSES,
  TALPA_STATUSES,
} from 'benefit-shared/constants';

describe('applications utils', () => {
  describe('getTagStyleForStatus', () => {
    it.each([
      APPLICATION_STATUSES.DRAFT,
      APPLICATION_STATUSES.INFO_REQUIRED,
      APPLICATION_STATUSES.RECEIVED,
      APPLICATION_STATUSES.ACCEPTED,
      APPLICATION_STATUSES.REJECTED,
      APPLICATION_STATUSES.CANCELLED,
      APPLICATION_STATUSES.HANDLING,
      APPLICATION_STATUSES.ARCHIVAL,
    ])('should return background and text for status %s', (status) => {
      const result = getTagStyleForStatus(status);
      expect(result).toHaveProperty('background');
      expect(result).toHaveProperty('text');
      expect(result.background).toBeTruthy();
      expect(result.text).toBeTruthy();
    });

    it('should return default style for unknown status', () => {
      const result = getTagStyleForStatus('unknown' as APPLICATION_STATUSES);
      expect(result).toHaveProperty('background');
      expect(result).toHaveProperty('text');
    });
  });

  describe('getInstalmentTagStyleForStatus', () => {
    it.each([
      INSTALMENT_STATUSES.WAITING,
      INSTALMENT_STATUSES.ACCEPTED,
      INSTALMENT_STATUSES.CANCELLED,
      INSTALMENT_STATUSES.PAID,
      INSTALMENT_STATUSES.ERROR_IN_TALPA,
      INSTALMENT_STATUSES.COMPLETED,
      INSTALMENT_STATUSES.REQUESTED,
      INSTALMENT_STATUSES.RESPONDED,
      INSTALMENT_STATUSES.PENDING,
    ])(
      'should return background and text for instalment status %s',
      (status) => {
        const result = getInstalmentTagStyleForStatus(status);
        expect(result).toHaveProperty('background');
        expect(result).toHaveProperty('text');
        expect(result.background).toBeTruthy();
      }
    );

    it('should return default style for undefined status', () => {
      const result = getInstalmentTagStyleForStatus();
      expect(result).toHaveProperty('background');
    });
  });

  describe('getTalpaTagStyleForStatus', () => {
    it.each([
      TALPA_STATUSES.NOT_SENT_TO_TALPA,
      TALPA_STATUSES.REJECTED_BY_TALPA,
      TALPA_STATUSES.SUCCESFULLY_SENT_TO_TALPA,
      TALPA_STATUSES.PARTIALLY_SENT_TO_TALPA,
    ])('should return background and text for talpa status %s', (status) => {
      const result = getTalpaTagStyleForStatus(status);
      expect(result).toHaveProperty('background');
      expect(result).toHaveProperty('text');
      expect(result.background).toBeTruthy();
    });

    it('should return default style for undefined status', () => {
      const result = getTalpaTagStyleForStatus();
      expect(result).toHaveProperty('background');
    });
  });
});
