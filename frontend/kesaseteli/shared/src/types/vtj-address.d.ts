import Nullable from '@frontend/shared/src/types/common/nullable';

type VtjAddress = Nullable<{
  LahiosoiteS: string;
  Postinumero: string;
  PostitoimipaikkaS: string;
  AsuminenAlkupvm: string; // date format: YYYYMMDD
  AsuminenLoppupvm: string; // date format: YYYYMMDD
}>;

export default VtjAddress;
