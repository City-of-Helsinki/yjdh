import { Button } from 'hds-react';
import useRegister from 'kesaseteli/youth/hooks/useRegister';
import School from 'kesaseteli/youth/types/School';
import Voucher from 'kesaseteli/youth/types/voucher-form-data';
import { Trans, useTranslation } from 'next-i18next';
import React from 'react';
import Checkbox from 'shared/components/forms/inputs/Checkbox';
import Combobox from 'shared/components/forms/inputs/Combobox';
import TextInput from 'shared/components/forms/inputs/TextInput';
import FormSection from 'shared/components/forms/section/FormSection';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { EMAIL_REGEX, POSTAL_CODE_REGEX } from 'shared/constants';

const schools: School[] = [
  'Aleksis Kiven peruskoulu',
  'Arabian peruskoulu',
  'Aurinkolahden peruskoulu',
  'Botby grundskola',
  'Brändö lågstadieskola',
  'Degerö lågstadieskola',
  'Drumsö lågstadieskola',
  'Grundskolan Norsen',
  'Haagan peruskoulu',
  'Hertsikan ala-asteen koulu',
  'Herttoniemenrannan ala-asteen koulu',
  'Hietakummun ala-asteen koulu',
  'Hiidenkiven peruskoulu',
  'Hoplaxskolan',
  'Itäkeskuksen peruskoulu',
  'Jätkäsaaren peruskoulu',
  'Kaisaniemen ala-asteen koulu',
  'Kalasataman peruskoulu',
  'Kallion ala-asteen koulu',
  'Kankarepuiston peruskoulu',
  'Kannelmäen peruskoulu',
  'Karviaistien koulu',
  'Katajanokan ala-asteen koulu',
  'Keinutien ala-asteen koulu',
  'Konalan ala-asteen koulu',
  'Kontulan ala-asteen koulu',
  'Koskelan ala-asteen koulu',
  'Kottby lågstadieskola',
  'Kruununhaan yläasteen koulu',
  'Kruunuvuorenrannan peruskoulu',
  'Kulosaaren ala-asteen koulu',
  'Käpylän peruskoulu',
  'Laajasalon peruskoulu',
  'Laakavuoren ala-asteen koulu',
  'Latokartanon peruskoulu',
  'Lauttasaaren ala-asteen koulu',
  'Maatullin peruskoulu',
  'Malmin peruskoulu',
  'Malminkartanon ala-asteen koulu',
  'Maunulan ala-asteen koulu',
  'Meilahden ala-asteen koulu',
  'Meilahden yläasteen koulu',
  'Mellunmäen ala-asteen koulu',
  'Merilahden peruskoulu',
  'Metsolan ala-asteen koulu',
  'Minervaskolan',
  'Munkkiniemen ala-asteen koulu',
  'Munkkivuoren ala-asteen koulu',
  'Myllypuron peruskoulu',
  'Månsas lågstadieskola',
  'Naulakallion koulu',
  'Nordsjö lågstadieskola',
  'Oulunkylän ala-asteen koulu',
  'Outamon koulu',
  'Pakilan ala-asteen koulu',
  'Pakilan yläasteen koulu',
  'Paloheinän ala-asteen koulu',
  'Pasilan peruskoulu',
  'Pihkapuiston ala-asteen koulu',
  'Pihlajamäen ala-asteen koulu',
  'Pihlajiston ala-asteen koulu',
  'Pikku Huopalahden ala-asteen koulu',
  'Pitäjänmäen peruskoulu',
  'Pohjois-Haagan ala-asteen koulu',
  'Poikkilaakson ala-asteen koulu',
  'Porolahden peruskoulu',
  'Puistolan peruskoulu',
  'Puistolanraitin ala-asteen koulu',
  'Puistopolun peruskoulu',
  'Pukinmäenkaaren peruskoulu',
  'Puotilan ala-asteen koulu',
  'Ressu Comprehensive School',
  'Ressun peruskoulu',
  'Roihuvuoren ala-asteen koulu',
  'Ruoholahden ala-asteen koulu',
  'Sakarinmäen peruskoulu',
  'Santahaminan ala-asteen koulu',
  'Siltamäen ala-asteen koulu',
  'Snellmanin ala-asteen koulu',
  'Solakallion koulu',
  'Sophie Mannerheimin koulu',
  'Staffansby lågstadieskola',
  'Strömbergin ala-asteen koulu',
  'Suomenlinnan ala-asteen koulu',
  'Suutarilan ala-asteen koulu',
  'Suutarinkylän peruskoulu',
  'Tahvonlahden ala-asteen koulu',
  'Taivallahden peruskoulu',
  'Tapanilan ala-asteen koulu',
  'Tehtaankadun ala-asteen koulu',
  'Toivolan koulu',
  'Torpparinmäen peruskoulu',
  'Töölön ala-asteen koulu',
  'Vallilan ala-asteen koulu',
  'Vartiokylän ala-asteen koulu',
  'Vartiokylän yläasteen koulu',
  'Vattuniemen ala-asteen koulu',
  'Vesalan peruskoulu',
  'Vuoniityn peruskoulu',
  'Yhtenäiskoulu',
  'Zacharias Topeliusskolan',
  'Åshöjdens grundskola',
  'Östersundom skola',
].map((school) => ({ name: school }));

const VoucherForm: React.FC = () => {
  const { t } = useTranslation();
  const register = useRegister();

  return (
    <form>
      <FormSection header={t('common:applicationPage.form.title')} columns={2}>
        <TextInput<Voucher>
          {...register('firstName', { required: true, maxLength: 256 })}
        />
        <TextInput<Voucher>
          {...register('lastName', { required: true, maxLength: 256 })}
        />
        <TextInput<Voucher>
          {...register('ssn', { required: true, maxLength: 32 })}
        />
        <TextInput<Voucher>
          {...register('postcode', {
            required: true,
            pattern: POSTAL_CODE_REGEX,
            maxLength: 256,
          })}
          type="number"
        />
        <Combobox<Voucher, School>
          {...register('school', { required: true })}
          optionLabelField="name"
          options={schools}
          $colSpan={2}
        />
        <TextInput<Voucher>
          {...register('email', {
            maxLength: 254,
            pattern: EMAIL_REGEX,
          })}
        />
        <TextInput<Voucher>
          {...register('ssn', { required: true, maxLength: 64 })}
        />
        <$GridCell $colSpan={2}>
          <Checkbox<Voucher>
            {...register('termsAndConditions', {
              required: true,
              maxLength: 64,
            })}
            label={
              <Trans
                i18nKey="common:applicationPage.form.termsAndConditions"
                components={{
                  a: (
                    <a
                      href={t('common:termsAndConditionsLink')}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {}
                    </a>
                  ),
                }}
              >
                {'Olen lukenut palvelun <a>käyttöehdot</a> ja hyväksyn ne.'}
              </Trans>
            }
          />
        </$GridCell>
        <$GridCell $colSpan={2}>
          <Button theme="coat">
            {t(`common:applicationPage.form.sendButton`)}
          </Button>
        </$GridCell>
      </FormSection>
    </form>
  );
};

export default VoucherForm;
