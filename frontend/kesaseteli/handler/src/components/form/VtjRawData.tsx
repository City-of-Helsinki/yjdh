import ActivatedYouthApplication from 'kesaseteli-shared/types/activated-youth-application';
import { useTranslation } from 'next-i18next';
import React from 'react';
import Accordion from 'shared/components/accordion/Accordion';
import { useTheme } from 'styled-components';

type Props = {
  data: ActivatedYouthApplication['encrypted_vtj_json'];
};
const VtjRawDataAccordion: React.FC<Props> = ({ data }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const rawData = React.useMemo(
    () =>
      JSON.stringify(
        data,
        (key: string, value: unknown) =>
          key.startsWith('@') || !value ? undefined : value,
        2
      ),
    [data]
  );
  /* eslint-disable no-secrets/no-secrets */
  return (
    <Accordion
      id="vtj-info-accordion"
      heading={t(`common:handlerApplication.vtjInfo.showRawData`)}
      card
      style={{
        padding: 0,
        maxWidth: '450px',
        fontSize: theme.fontSize.body.s,
        background: theme.colors.infoLight,
      }}
      onToggle={() => {}}
    >
      <pre
        style={{
          fontSize: theme.fontSize.body.s,
          height: '300px',
          overflowY: 'scroll',
          scrollbarColor: 'rebeccapurple green',
        }}
      >
        {rawData}
      </pre>
    </Accordion>
  );
  /* eslint-enable no-secrets/no-secrets */
};

export default VtjRawDataAccordion;
