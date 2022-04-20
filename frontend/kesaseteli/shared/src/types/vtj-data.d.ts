import VtjAddress from './vtj-address';
import Nullable from 'shared/types/common/nullable';

type VtjData = Nullable<{
  Asiakasinfo: {
    InfoS: string; // fetch time in format: dd.MM.yyyy hh:ss
  };
  Henkilo: {
    Henkilotunnus: {
      '@voimassaolokoodi': string; // 1 = OK
      '#text': string; // social security number
    };
    NykyinenSukunimi: {
      Sukunimi: string;
    };
    NykyisetEtunimet: {
      Etunimet: string;
    };
    VakinainenKotimainenLahiosoite: VtjAddress;
    TilapainenKotimainenLahiosoite: VtjAddress;
    Kuolintiedot: {
      Kuollut: string; // 1 == true
    };
  };
}>;

export default VtjData;
