import Voucher from 'kesaseteli/youth/types/Voucher';

type VoucherFormData = Voucher & {
  schoolNotFound: boolean;
  termsAndConditions: boolean;
};

export default VoucherFormData;
