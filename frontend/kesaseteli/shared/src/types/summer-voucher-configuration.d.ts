type SummerVoucherConfiguration = {
  year: number;
  voucher_value_in_euros: number;
  min_work_compensation_in_euros: number;
  min_work_hours: number;
  target_groups: {
    id: string;
    name: string;
    description: string;
  }[];
};

export default SummerVoucherConfiguration;
