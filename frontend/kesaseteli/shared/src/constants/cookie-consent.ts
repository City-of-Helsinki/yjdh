import { type Language } from 'shared/i18n/i18n';

// Non-localizable site name for cookie consent,
// does not use non-ascii characters for maximum compatibility.
export const COOKIE_CONSENT_SITE_NAME = 'Kesaseteli';

// Named values for HDS's unnamed storage types 1–5
export enum StorageType {
  Cookie = 1,
  LocalStorage = 2,
  SessionStorage = 3,
  IndexedDB = 4,
  CacheStorage = 5,
}

export const ESSENTIAL_COOKIES_TITLE = {
  fi: 'Välttämättömät toiminnalliset evästeet',
  sv: 'Nödvändiga funktionella cookies',
  en: 'Essential functional cookies',
} as const satisfies Record<Language, string>;

export const ESSENTIAL_COOKIES_DESCRIPTION = {
  fi: 'Välttämättömät evästeet auttavat tekemään verkkosivustosta käyttökelpoisen sallimalla perustoimintoja, kuten sivulla siirtymisen ja sivuston suojattujen alueiden käytön. Verkkosivusto ei toimi kunnolla ilman näitä evästeitä eikä niihin tarvita suostumusta.',
  sv: 'Nödvändiga cookies hjälper till att göra webbplatsen användbar genom att tillåta grundläggande funktioner som att navigera på sidan och använda de skyddade områdena på webbplatsen. Webbplatsen fungerar inte korrekt utan dessa cookies och kräver inte samtycke.',
  en: 'Essential cookies help to make the website usable by allowing basic functions, navigating the page and using the protected areas of the site. The website will not work properly without these cookies and their consent is not required.',
} as const satisfies Record<Language, string>;

export const AUTH_SESSION_COOKIE_DESCRIPTION = {
  fi: 'Tunnistautumisistunnon säilymiseksi vaadittu eväste.',
  sv: 'Cookie som krävs för att bevara autentiseringssession.',
  en: 'Required to persist the authentication session.',
} as const satisfies Record<Language, string>;

export const SECURITY_CONTROL_COOKIE_DESCRIPTION = {
  fi: 'Tietoturvakontrolli',
  sv: 'Datasäkerhetskontroll',
  en: 'A security control',
} as const satisfies Record<Language, string>;

export const LOCALIZED_TWO_HOURS = {
  fi: '2 tuntia',
  sv: '2 timmar',
  en: '2 hours',
} as const satisfies Record<Language, string>;

export const LOCALIZED_364_DAYS = {
  fi: '364 päivää',
  sv: '364 dagar',
  en: '364 days',
} as const satisfies Record<Language, string>;
