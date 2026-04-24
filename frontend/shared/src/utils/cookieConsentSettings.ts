import { CookieConsentContextProps } from 'hds-react';

type SupportedLanguage = 'fi' | 'sv' | 'en';

export type LocalizedSiteName = Record<SupportedLanguage, string>;

type SiteSettings = NonNullable<CookieConsentContextProps['siteSettings']>;
export type RequiredGroups = NonNullable<SiteSettings['requiredGroups']>;
export type OptionalGroups = NonNullable<SiteSettings['optionalGroups']>;
export type CookieConsentApp = 'kesaseteli' | 'benefit';

type GetCookieConsentSiteSettingsOptions = {
  siteName: string | Partial<LocalizedSiteName>;
  app?: CookieConsentApp;
  hostName?: string;
  requiredGroups?: RequiredGroups;
  optionalGroups?: OptionalGroups;
};

const DEFAULT_SITE_NAMES_BY_APP: Record<CookieConsentApp, LocalizedSiteName> = {
  kesaseteli: {
    fi: 'Kesaseteli',
    sv: 'Kesaseteli',
    en: 'Kesaseteli',
  },
  benefit: {
    fi: 'Helsinki-lisä',
    sv: 'Helsingforstillägg',
    en: 'Helsinki benefit',
  },
};

const DEFAULT_COOKIE_HOST_NAME_BY_APP: Record<CookieConsentApp, string> = {
  kesaseteli: 'nuortenkesaseteli.hel.fi',
  benefit: 'helsinkilisa.hel.fi',
};

const getSiteNameMap = (
  siteName: string | Partial<LocalizedSiteName>,
  app: CookieConsentApp
): LocalizedSiteName => {
  const defaultSiteNames = DEFAULT_SITE_NAMES_BY_APP[app];

  if (typeof siteName === 'string') {
    return {
      fi: siteName,
      sv: siteName,
      en: siteName,
    };
  }

  return {
    fi: siteName.fi ?? defaultSiteNames.fi,
    sv: siteName.sv ?? siteName.fi ?? defaultSiteNames.sv,
    en: siteName.en ?? siteName.fi ?? defaultSiteNames.en,
  };
};

const getCurrentPageHostName = (app: CookieConsentApp): string => {
  if (typeof window !== 'undefined' && window.location?.hostname) {
    return window.location.hostname;
  }

  // SSR cannot read window.location, so use the app's canonical host here.
  return DEFAULT_COOKIE_HOST_NAME_BY_APP[app];
};

const buildBenefitRequiredGroups = (hostName: string): RequiredGroups => [
  {
    groupId: 'tunnistamo',
    title: {
      fi: 'Kirjautuminen',
      sv: 'Inloggning',
      en: 'Login',
    },
    description: {
      fi: 'Kirjautumisevasteita kaytetaan kayttajan kirjautuessa palveluun.',
      sv: 'Inloggningskakor anvands nar anvandaren loggar in pa tjansten.',
      en: 'Login cookies are used when the user logs in to the service.',
    },
    cookies: [
      {
        name: 'sessionid',
        host: hostName,
        description: {
          fi: 'Tunnistautumisistunnon sailymiseksi vaadittu evaste.',
          sv: 'Cookie som kravs for att bevara autentiseringssession.',
          en: 'Required to persist the authentication session.',
        },
        expiration: {
          fi: '1 tunti',
          sv: '1 timme',
          en: '1 hour',
        },
        storageType: 1,
      },
      {
        name: 'csrftoken',
        host: hostName,
        description: {
          fi: 'Tietoturvakontrolli',
          sv: 'Datasakerhetskontroll',
          en: 'A security control',
        },
        expiration: '-',
        storageType: 1,
      },
    ],
  },
  {
    groupId: 'essential',
    title: {
      en: 'Essential cookies',
      fi: 'Valttamattomat evasteet',
      sv: 'Nodvandiga kakor',
    },
    description: {
      en: 'Essential cookies are necessary for the website to function properly. These cookies do not collect any personal information.',
      fi: 'Valttamattomat evasteet ovat tarpeellisia sivuston toiminnan kannalta. Nama evasteet eivat keraa henkilotietoja.',
      sv: 'Nodvandiga kakor kravs for att webbplatsen ska fungera korrekt. Dessa kakor samlar inte in personuppgifter.',
    },
    cookies: [
      {
        name: 'django_language',
        host: hostName,
        description: {
          fi: 'Evaste vaaditaan jotta kayttajan kielivalinta sailyisi.',
          sv: 'Kakan kravs for att spara anvandarens sprakval.',
          en: "Required to persist the user's chosen language.",
        },
        expiration: {
          fi: 'Istunto',
          sv: 'Session',
          en: 'Session',
        },
        storageType: 1,
      },
      {
        name: 'isTermsOfServiceApproved',
        host: hostName,
        description: {
          fi: 'Evaste vaaditaan kayttoehtojen hyvaksymisen tallentamiseen.',
          sv: 'Kakan kravs for att spara anvandarens godkannande av anvandarvillkoren.',
          en: 'Required to store the acceptance of the terms of service.',
        },
        expiration: '-',
        storageType: 3,
      },
    ],
  },
  {
    groupId: 'shared',
    title: {
      fi: 'Yhteiset evasteet',
      sv: 'Gemensamma kakor',
      en: 'Shared consent',
    },
    description: {
      fi: 'Helsingin kaupungin palvelut kayttavat yhteisia evasteita. Tallennamme nama suostumukset, jottei sinun tarvitse hyvaksy samoja evasteita uudelleen kaupungin muissa palveluissa.',
      sv: 'Helsingfors stads tjanster anvander gemensamma kakor. Vi lagrar dessa samtycken sa att du inte behover godkanna samma kakor igen i stadens andra tjanster.',
      en: 'City of Helsinki services use shared consent. We will store these consents so that you do not have to accept the same cookies again on other City services.',
    },
    cookies: [
      {
        name: 'helfi-cookie-consents',
        host: hostName,
        storageType: 1,
        description: {
          fi: 'Sivusto kayttaa tata evastetta tietojen tallentamiseen siita, ovatko kavijat antaneet hyvaksyntansa tai kieltaytyneet evasteiden kaytosta.',
          sv: 'Webbplatsen anvander denna kaka for att lagra information om huruvida besokare har godkant anvandningen av kakor eller inte.',
          en: 'Used to store information about whether visitors have given or declined the use of cookie categories used on the site.',
        },
        expiration: {
          fi: '1 vuosi',
          sv: 'Ett ar',
          en: '1 year',
        },
      },
      {
        name: 'helfi-consent-version',
        host: hostName,
        storageType: 1,
        description: {
          fi: 'Tahan evasteeseen tallennetaan kayttajan hyvaksyma evasteselosteen versio.',
          sv: 'Anvands for att lagra information om versionen av cookies samtycke som anvandaren har godkant.',
          en: 'Used to store information about what version of the cookie consent the user has agreed to.',
        },
        expiration: {
          fi: '1 vuosi',
          sv: 'Ett ar',
          en: '1 year',
        },
      },
    ],
  },
];

export const getDefaultKesaseteliRequiredGroups = (
  hostName = getCurrentPageHostName('kesaseteli')
): RequiredGroups => [
  {
    groupId: 'shared',
    title: {
      fi: 'Yhteiset evasteet',
      sv: 'Gemensamma kakor',
      en: 'Shared consent',
    },
    description: {
      fi: 'Helsingin kaupungin palvelut kayttavat yhteisia evasteita. Tallennamme nama suostumukset, jottei sinun tarvitse hyvaksy samoja evasteita uudelleen kaupungin muissa palveluissa.',
      sv: 'Helsingfors stads tjanster anvander gemensamma kakor. Vi lagrar dessa samtycken sa att du inte behover godkanna samma kakor igen i stadens andra tjanster.',
      en: 'City of Helsinki services use shared consent. We will store these consents so that you do not have to accept the same cookies again on other City services.',
    },
    cookies: [
      {
        name: 'helfi-cookie-consents',
        host: hostName,
        storageType: 1,
        description: {
          fi: 'Sivusto kayttaa tata evastetta tietojen tallentamiseen siita, ovatko kavijat antaneet hyvaksyntansa tai kieltaytyneet evasteiden kaytosta.',
          sv: 'Webbplatsen anvander denna kaka for att lagra information om huruvida besokare har godkant anvandningen av kakor eller inte.',
          en: 'Used to store information about whether visitors have given or declined the use of cookie categories used on the site.',
        },
        expiration: {
          fi: '1 vuosi',
          sv: 'Ett ar',
          en: '1 year',
        },
      },
      {
        name: 'helfi-consent-version',
        host: hostName,
        storageType: 1,
        description: {
          fi: 'Tahan evasteeseen tallennetaan kayttajan hyvaksyma evasteselosteen versio.',
          sv: 'Anvands for att lagra information om versionen av cookies samtycke som anvandaren har godkant.',
          en: 'Used to store information about what version of the cookie consent the user has agreed to.',
        },
        expiration: {
          fi: '1 vuosi',
          sv: 'Ett ar',
          en: '1 year',
        },
      },
    ],
  },
];

export const getDefaultBenefitRequiredGroups = (
  hostName = getCurrentPageHostName('benefit')
): RequiredGroups => buildBenefitRequiredGroups(hostName);

export const getDefaultKesaseteliOptionalGroups = (
  hostName = getCurrentPageHostName('kesaseteli')
): OptionalGroups => [
  {
    groupId: 'statistics',
    title: {
      fi: 'Tilastointi',
      sv: 'Statistik',
      en: 'Statistics',
    },
    description: {
      fi: 'Tilastointievasteiden keraamaa tietoa kaytetaan verkkosivuston kehittamiseen.',
      sv: 'Data fran statistikkakorna anvands for att utveckla webbplatsen.',
      en: 'The information collected by statistics cookies is used to develop the website.',
    },
    cookies: [
      {
        name: '_pk_id.*',
        host: hostName,
        description: {
          fi: 'Matomo-tilastointijarjestelman evaste.',
          sv: 'Matomo-statistiksystemets kaka samlar information om hur webbplatsen anvands.',
          en: 'Matomo Analytics - used to store a few details about the user such as the unique visitor ID',
        },
        expiration: {
          fi: '393 paivaa',
          sv: '393 dagar',
          en: '393 days',
        },
        storageType: 1,
      },
      {
        name: '_pk_ses.*',
        host: hostName,
        description: {
          fi: 'Matomo-tilastointijarjestelman evaste.',
          sv: 'Matomo-statistiksystemets kaka samlar information om hur webbplatsen anvands.',
          en: 'Matomo Analytics - used to store a few details about the user such as the unique visitor ID',
        },
        expiration: {
          fi: '1 tunti',
          sv: '1 timme',
          en: '1 hour',
        },
        storageType: 1,
      },
    ],
  },
];

export const getDefaultBenefitOptionalGroups = (
  hostName = getCurrentPageHostName('benefit')
): OptionalGroups => [
  {
    groupId: 'statistics',
    title: {
      fi: 'Tilastointi',
      sv: 'Statistik',
      en: 'Statistics',
    },
    description: {
      fi: 'Tilastointievasteiden keraamaa tietoa kaytetaan verkkosivuston kehittamiseen.',
      sv: 'Data fran statistikkakorna anvands for att utveckla webbplatsen.',
      en: 'The information collected by statistics cookies is used to develop the website.',
    },
    cookies: [
      {
        name: '_pk_id.*',
        host: hostName,
        description: {
          fi: 'Matomo-tilastointijarjestelman evaste.',
          sv: 'Matomo-statistiksystemets kaka samlar information om hur webbplatsen anvands.',
          en: 'Matomo Analytics - used to store a few details about the user such as the unique visitor ID',
        },
        expiration: {
          fi: '393 paivaa',
          sv: '393 dagar',
          en: '393 days',
        },
        storageType: 1,
      },
      {
        name: '_pk_ses.*',
        host: hostName,
        description: {
          fi: 'Matomo-tilastointijarjestelman evaste.',
          sv: 'Matomo-statistiksystemets kaka samlar information om hur webbplatsen anvands.',
          en: 'Matomo Analytics - used to store a few details about the user such as the unique visitor ID',
        },
        expiration: {
          fi: '1 tunti',
          sv: '1 timme',
          en: '1 hour',
        },
        storageType: 1,
      },
      {
        id: 'rns',
        name: 'rnsbid',
        host: 'reactandshare.com',
        description: {
          fi: 'Askem-reaktionappien toimintaan liittyva tietue.',
          sv: 'En post relaterad till driften av reaktionsknappen Askem.',
          en: 'A record related to the operation of the Askem react buttons.',
        },
        expiration: '-',
        storageType: 1,
      },
      {
        id: 'rnsbid_ts',
        name: 'rnsbid_ts',
        host: 'reactandshare.com',
        description: {
          fi: 'Askem-reaktionappien toimintaan liittyva tietue.',
          sv: 'En post relaterad till driften av reaktionsknappen Askem.',
          en: 'A record related to the operation of the Askem react buttons.',
        },
        expiration: '-',
        storageType: 1,
      },
      {
        id: 'rns_reaction',
        name: 'rns_reaction_*',
        host: 'reactandshare.com',
        description: {
          fi: 'Askem-reaktionappien toimintaan liittyva tietue.',
          sv: 'En post relaterad till driften av reaktionsknappen Askem.',
          en: 'A record related to the operation of the Askem react buttons.',
        },
        expiration: '-',
        storageType: 1,
      },
    ],
  },
];

export const getCookieConsentSiteSettings = ({
  siteName,
  app = 'kesaseteli',
  hostName,
  requiredGroups,
  optionalGroups,
}: GetCookieConsentSiteSettingsOptions): SiteSettings => {
  const resolvedHostName = hostName ?? getCurrentPageHostName(app);
  const defaultRequiredGroups =
    app === 'benefit'
      ? getDefaultBenefitRequiredGroups(resolvedHostName)
      : getDefaultKesaseteliRequiredGroups(resolvedHostName);
  const defaultOptionalGroups =
    app === 'benefit'
      ? getDefaultBenefitOptionalGroups(resolvedHostName)
      : getDefaultKesaseteliOptionalGroups(resolvedHostName);
  const resolvedRequiredGroups = requiredGroups ?? defaultRequiredGroups;
  const resolvedOptionalGroups = optionalGroups ?? defaultOptionalGroups;

  return {
    languages: [
      {
        code: 'fi',
        name: 'Finnish',
        direction: 'ltr',
      },
      {
        code: 'sv',
        name: 'Swedish',
        direction: 'ltr',
      },
      {
        code: 'en',
        name: 'English',
        direction: 'ltr',
      },
    ],
    siteName: getSiteNameMap(siteName, app),
    cookieName: 'helfi-cookie-consents',
    monitorInterval: 0,
    fallbackLanguage: 'en',
    requiredGroups: resolvedRequiredGroups,
    optionalGroups: resolvedOptionalGroups,
    robotCookies: [
      {
        name: 'ally-supports-cache',
        storageType: 2,
      },
    ],
    translations: {
      bannerAriaLabel: {
        fi: 'Evasteasetukset',
        sv: 'Installningar for kakor',
        en: 'Cookie settings',
      },
      heading: {
        fi: '{{siteName}} kayttaa evasteita',
        sv: '{{siteName}} anvander kakor',
        en: '{{siteName}} uses cookies',
      },
      description: {
        fi: 'Tama sivusto kayttaa valttamattomia evasteita sivun perustoimintojen ja suorituskyvyn varmistamiseksi. Lisaksi kaytamme kohdennusevasteita kayttajakokemuksen parantamiseksi, analytiikkaan ja yksiloidyn sisallon nayttamiseen.',
        sv: 'Denna webbplats anvander obligatoriska kakor for att sakerstalla de grundlaggande funktionerna och prestandan. Dessutom anvander vi inriktningskakor for battre anvandarupplevelse, analytik och individualiserat innehall.',
        en: 'This website uses required cookies to ensure the basic functionality and performance. In addition, we use targeting cookies to improve the user experience, perform analytics and display personalised content.',
      },
      showDetails: {
        fi: 'Nayta yksityiskohdat',
        sv: 'Visa detaljer',
        en: 'Show details',
      },
      hideDetails: {
        fi: 'Piilota yksityiskohdat',
        sv: 'Stanga detaljer',
        en: 'Hide details',
      },
      formHeading: {
        fi: 'Tietoa sivustolla kaytetyista evasteista',
        sv: 'Information om kakor som anvands pa webbplatsen',
        en: 'About the cookies used on the website',
      },
      formText: {
        fi: 'Sivustolla kaytetyt evasteet on luokiteltu kayttotarkoituksen mukaan. Alla voit lukea eri luokista ja sallia tai kieltää evasteiden kayton.',
        sv: 'Kakorna som anvands pa webbplatsen har klassificerats enligt anvandningsandamal. Du kan lasa om de olika klasserna och acceptera eller forbjuda anvandningen av kakor.',
        en: 'The cookies used on the website have been classified according to their intended use. Below, you can read about the various categories and accept or reject the use of cookies.',
      },
      highlightedGroup: {
        fi: 'Sinun on hyvaksyttava tama kategoria, jotta voit nayttaa valitsemasi sisallon.',
        sv: 'Du maste acceptera den har kategorin for att visa innehallet du har valt.',
        en: 'You need to accept this category to display the content you have selected.',
      },
      highlightedGroupAria: {
        fi: 'Hyva tietaa kategorialle: {{title}}',
        sv: 'Bra att veta for kategorin: {{title}}',
        en: 'Good to know for category: {{title}}',
      },
      showCookieSettings: {
        fi: 'Nayta evasteasetukset',
        sv: 'Visa kakinstallningarna',
        en: 'Show cookie settings',
      },
      hideCookieSettings: {
        fi: 'Piilota evasteasetukset',
        sv: 'Stanga kakinstallningarna',
        en: 'Hide cookie settings',
      },
      acceptedAt: {
        fi: 'Olet hyvaksynt taman kategorian: {{date}} klo {{time}}.',
        sv: 'Du har accepterat denna kategori: {{date}} kl. {{time}}.',
        en: 'You have accepted this category: {{date}} at {{time}}.',
      },
      tableHeadingsName: {
        fi: 'Nimi',
        sv: 'Namn',
        en: 'Name',
      },
      tableHeadingsHostName: {
        fi: 'Evasteen asettaja',
        sv: 'Den som lagrat kakan',
        en: 'Cookie set by',
      },
      tableHeadingsDescription: {
        fi: 'Kayttotarkoitus',
        sv: 'Anvandning',
        en: 'Purpose of use',
      },
      tableHeadingsExpiration: {
        fi: 'Voimassaoloaika',
        sv: 'Giltighetstid',
        en: 'Period of validity',
      },
      tableHeadingsType: {
        fi: 'Tyyppi',
        sv: 'Typ',
        en: 'Type',
      },
      approveAllConsents: {
        fi: 'Hyvaksy kaikki evasteet',
        sv: 'Acceptera alla kakor',
        en: 'Accept all cookies',
      },
      approveRequiredAndSelectedConsents: {
        fi: 'Hyvaksy valitut evasteet',
        sv: 'Acceptera valda kakor',
        en: 'Accept selected cookies',
      },
      approveOnlyRequiredConsents: {
        fi: 'Hyvaksy vain valttamattomat evasteet',
        sv: 'Acceptera endast nodvandiga',
        en: 'Accept required cookies only',
      },
      settingsSaved: {
        fi: 'Asetukset tallennettu!',
        sv: 'Installningar sparade!',
        en: 'Settings saved!',
      },
      notificationAriaLabel: {
        fi: 'Ilmoitus',
        sv: 'Meddelande',
        en: 'Announcement',
      },
      storageType1: {
        fi: 'Evaste',
        sv: 'Kakan',
        en: 'Cookie',
      },
      storageType2: 'localStorage',
      storageType3: 'sessionStorage',
      storageType4: 'IndexedDB',
      storageType5: 'Cache Storage',
    },
  };
};
