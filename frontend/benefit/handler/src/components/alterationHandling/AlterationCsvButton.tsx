import { ApplicationAlteration } from 'benefit-shared/types/application';
import { Button, ButtonTheme, IconDownload } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';

type Props = {
  alteration: ApplicationAlteration;
  theme?: ButtonTheme;
  secondary?: boolean;
};

const AlterationCsvButton: React.FC<Props> = ({
  theme,
  secondary,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  alteration,
}) => {
  const { t } = useTranslation();

  // TODO: Talpa integration to be implemented in HL-887
  return (
    <Button
      disabled
      theme={theme}
      variant={secondary ? 'secondary' : 'primary'}
      iconLeft={<IconDownload />}
      onClick={() => {}}
    >
      {t('common:applications.alterations.handling.talpaCsv.button')}
    </Button>
  );
};

export default AlterationCsvButton;
