export type ApplicationFormData = {
  organization: {
    iban: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    coOperationNegotiationsDescription: string;
  };
  employee: {
    firstName: string;
    lastName: string;
    ssn: string;
    title: string;
    workHours: string;
    collectiveBargainingAgreement: string;
    monthlyPay: string;
    otherExpenses: string;
    vacationMoney: string;
    startDate: string;
    endDate: string;
  };

  deMinimisAid: {
    granter: string;
    amount: string;
    grantedAt: string;
  };
};
