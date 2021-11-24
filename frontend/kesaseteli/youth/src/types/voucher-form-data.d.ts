import Voucher from 'kesaseteli/youth/types/Voucher';

type VoucherFormData = Voucher & {
  termsAndConditions: boolean;
};

export default VoucherFormData;
