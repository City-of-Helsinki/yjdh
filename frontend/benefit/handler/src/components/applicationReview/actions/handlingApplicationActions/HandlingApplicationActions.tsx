import { APPLICATION_STATUSES } from 'benefit/handler/constants';
import useUpdateApplicationQuery from 'benefit/handler/hooks/useUpdateApplicationQuery';
import {
  Application,
  ApplicationData,
} from 'benefit/handler/types/application';
import { Button, IconPen, IconTrash } from 'hds-react';
import noop from 'lodash/noop';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import snakecaseKeys from 'snakecase-keys';

import { $Column, $Wrapper } from './HandlingApplicationActions.sc';

export type Props = {
  application: Application;
};

const HandlingApplicationActions: React.FC<Props> = ({ application }) => {
  const translationsBase = 'common:review.actions';
  const { t } = useTranslation();

  const { mutate: updateApplication } = useUpdateApplicationQuery();

  const handleDone = (): void => {
    const currentApplicationData: ApplicationData = snakecaseKeys(
      {
        ...application,
        status: APPLICATION_STATUSES.HANDLING,
      },
      { deep: true }
    );
    updateApplication(currentApplicationData);
  };

  return (
    <$Wrapper>
      <$Column>
        <Button onClick={handleDone} theme="coat">
          {t(`${translationsBase}.done`)}
        </Button>
        <Button onClick={noop} theme="black" variant="secondary">
          {t(`${translationsBase}.saveAndContinue`)}
        </Button>
        <Button
          onClick={noop}
          theme="black"
          variant="secondary"
          iconLeft={<IconPen />}
        >
          {t(`${translationsBase}.handlingPanel`)}
        </Button>
      </$Column>
      <$Column>
        <Button
          onClick={noop}
          theme="black"
          variant="supplementary"
          iconLeft={<IconTrash />}
        >
          {t(`${translationsBase}.cancel`)}
        </Button>
      </$Column>
    </$Wrapper>
  );
};

export default HandlingApplicationActions;
