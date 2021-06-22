import Company from 'kesaseteli/employer/types/company';

type Application = {
  id: string;
  company: Company;
  invoicer_email: string;
  invoicer_name: string;
  invoicer_phone_number: string;
  status: string;
  summer_vouchers: [],
};
export default Application;
