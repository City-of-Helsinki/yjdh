import { Button } from 'hds-react';
import useRegisterInput from 'kesaseteli/youth/hooks/useRegisterInput';
import School from 'kesaseteli/youth/types/School';
import YouthFormData from 'kesaseteli/youth/types/youth-form-data';
import { Trans, useTranslation } from 'next-i18next';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import Heading from 'shared/components/forms/heading/Heading';
import Checkbox from 'shared/components/forms/inputs/Checkbox';
import Combobox from 'shared/components/forms/inputs/Combobox';
import SocialSecurityNumberInput from 'shared/components/forms/inputs/SocialSecurityNumberInput';
import TextInput from 'shared/components/forms/inputs/TextInput';
import FormSection from 'shared/components/forms/section/FormSection';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { EMAIL_REGEX, NAMES_REGEX, PHONE_NUMBER_REGEX } from 'shared/constants';
import useToggle from 'shared/hooks/useToggle';

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

const YouthForm: React.FC = () => {
  const { t } = useTranslation();
  const register = useRegisterInput<YouthFormData>();

  const [showResult, setShowResult] = React.useState(false);
  const [schoolIsUnlisted, toggleSchoolIsUnlisted] = useToggle(false);

  const { getValues, handleSubmit, clearErrors, setValue } =
    useFormContext<YouthFormData>();

  const handleToggleSchoolUnlisted = React.useCallback(
    (unlisted?: boolean) => {
      if (unlisted) {
        clearErrors('school');
        setValue('school', null);
      } else {
        clearErrors('unlisted_school');
        setValue('unlisted_school', null);
      }
      toggleSchoolIsUnlisted();
    },
    [clearErrors, setValue, toggleSchoolIsUnlisted]
  );

  return (
    <>
      <Heading header={t('common:youthApplication.form.title')} />
      <p>{t('common:youthApplication.form.info')}</p>
      <form data-testid="youth-form">
        <FormSection columns={2}>
          <TextInput<YouthFormData>
            {...register('first_name', {
              required: true,
              pattern: NAMES_REGEX,
              maxLength: 256,
            })}
          />
          <TextInput<YouthFormData>
            {...register('last_name', {
              required: true,
              pattern: NAMES_REGEX,
              maxLength: 256,
            })}
          />
          <SocialSecurityNumberInput<YouthFormData>
            {...register('social_security_number', {
              required: true,
            })}
          />
          <Combobox<YouthFormData, School>
            {...register('school', { required: !schoolIsUnlisted })}
            optionLabelField="name"
            options={schools}
            disabled={schoolIsUnlisted}
            placeholder={t('common:youthApplication.form.schoolPlaceholder')}
            $colSpan={2}
            label={t('common:youthApplication.form.schoolDropdown')}
          />
          <$GridCell $colSpan={2}>
            <Checkbox<YouthFormData>
              {...register('is_unlisted_school')}
              onChange={handleToggleSchoolUnlisted}
            />
          </$GridCell>
          {schoolIsUnlisted && (
            <TextInput<YouthFormData>
              {...register('unlisted_school', {
                required: true,
                maxLength: 256,
                pattern: NAMES_REGEX,
              })}
              $colSpan={2}
              label={t('common:youthApplication.form.schoolName')}
              placeholder={t(
                'common:youthApplication.form.schoolNamePlaceholder'
              )}
            />
          )}
          <TextInput<YouthFormData>
            {...register('phone_number', {
              required: true,
              maxLength: 64,
              pattern: PHONE_NUMBER_REGEX,
            })}
          />
          <TextInput<YouthFormData>
            {...register('email', {
              maxLength: 254,
              pattern: EMAIL_REGEX,
              required: true,
            })}
          />
          <$GridCell $colSpan={2}>
            <Checkbox<YouthFormData>
              {...register('termsAndConditions', {
                required: true,
              })}
              label={
                <Trans
                  i18nKey="common:youthApplication.form.termsAndConditions"
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
            <Button
              theme="coat"
              onClick={handleSubmit(() => setShowResult(true))}
            >
              {t(`common:youthApplication.form.sendButton`)}
            </Button>
          </$GridCell>
          {showResult && (
            <pre data-testid="result">
              {JSON.stringify(getValues(), null, 2)}
            </pre>
          )}
        </FormSection>
      </form>
    </>
  );
};

export default YouthForm;
