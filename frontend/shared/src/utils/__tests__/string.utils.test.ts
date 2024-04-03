import { getInitials } from 'shared/utils/string.utils';

describe('string utils', () => {
  describe('getInitials', () => {
    it('should get proper initials for a Latin-1 name', () => {
      expect(getInitials('Olli Testaaja')).toBe('OT');
    });

    it('should get proper initials for a name with Finnish or Swedish accented initials', () => {
      expect(getInitials('Åke Lindqvist')).toBe('ÅL');
      expect(getInitials('Jaakko Österlund')).toBe('JÖ');
      expect(getInitials('Åke Österlund')).toBe('ÅÖ');
    });

    it('should get proper initials for name containing accented Finnish and Swedish letters outside the initials', () => {
      expect(getInitials('Minna Hämäläinen')).toBe('MH');
      expect(getInitials('Gösta Andersson')).toBe('GA');
      expect(getInitials('Gösta Hämäläinen')).toBe('GH');
    });

    it('should output a default response for non-name inputs', () => {
      expect(getInitials('')).toBe('?');
      expect(getInitials('12345 67890')).toBe('?');
    });
  });
});
