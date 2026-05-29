export type ApplicationFormData = {
  organization: {
    iban: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    coOperationNegotiationsDescription: string;
    companyNumberOfEmployees: string;
    companyBusinessBrief: string;
  };
  employee: {
    firstName: string;
    lastName: string;
    ssn: string;
    title: string;
    roleOfEmployeeInOrganization: string;
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
