import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import useToggle from 'shared/hooks/useToggle';

type Type = [boolean, () => void];

const useInvoicerToggle = (): Type => {
  const { applicationQuery } = useApplicationApi();

  const showInitially =
    (applicationQuery.isSuccess &&
      applicationQuery.data.is_separate_invoicer) ||
    false;
  return useToggle(showInitially);
};

export default useInvoicerToggle;
