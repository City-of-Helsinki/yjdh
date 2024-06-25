export const NEW_FORM_DATA = {
  company: {
    id: '0201256-6',
    bankAccountNumber: 'FI81 4975 4587 0004 02',
    firstName: 'Kuura',
    lastName: 'Massi-Päällikkö',
    phone: '050 000 0000',
    email: 'hki-benefit@example.com',
    coOperationNegotiationsDescription: 'Lorem ipsum dolor sit amet',
  },
  employee: {
    firstName: 'Ruu',
    lastName: 'Rättisitikka',
    ssn: '050632-8912',
    monthlyPay: '1800',
    vacationMoney: '100',
    otherExpenses: '300',
    jobTitle: 'Verkkosamooja',
    workingHours: '30',
    collectiveBargainingAgreement: 'Yleinen TES',
  },
  deminimis: {
    granter: 'Valtio',
    amount: '2000',
    grantedAt: `1.1.${new Date().getFullYear()}`,
  },
};

export const EDIT_FORM_DATA = {
  company: {
    bankAccountNumber: 'FI65 4712 8581 0006 05',
    firstName: 'Malla',
    lastName: 'Jout-Sen',
    phone: '040 123 4567',
    email: 'yjdh-helsinkilisa@example.net',
    coOperationNegotiationsDescription: 'Aenean fringilla lorem tellus',
  },
  employee: {
    firstName: 'Cool',
    lastName: 'Kanerva',
    ssn: '211081-2043',
    monthlyPay: '1111',
    vacationMoney: '222',
    otherExpenses: '333',
    jobTitle: 'Some-asiantuntija',
    workingHours: '18',
    collectiveBargainingAgreement: '-',
  },
  deminimis: {
    granter: 'Hyvän tekijät Inc.',
    amount: '3000',
    grantedAt: `3.3.${new Date().getFullYear() - 1}`,
  },
};

export const NEW_TERMINATION_ALTERATION_DATA = {
  endDate: '23.8.2024',
  contactPersonName: 'Yhteys Henkilö',
  einvoiceAddress: '012345012345',
  einvoiceProviderIdentifier: 'LILAFI11',
  einvoiceProviderName: 'Liiba Laaba Oy',
  reason: 'Ei soveltunut työhön',
};

export const NEW_SUSPENSION_ALTERATION_DATA = {
  endDate: '24.6.2024',
  resumeDate: '12.8.2024',
  contactPersonName: 'Sauli Säätäjä',
  einvoiceAddress: '678678678',
  einvoiceProviderIdentifier: 'ELKLFI99',
  einvoiceProviderName: 'Eelin Keelin Oy',
  reason: 'Omaehtoinen loma',
};
