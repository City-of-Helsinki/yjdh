import { StepActionType } from 'benefit/handler/hooks/useSteps';
import { Button, IconPen } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { focusAndScroll } from 'shared/utils/dom.utils';

type Props = {
  section: string;
  dispatchStep: React.Dispatch<StepActionType>;
};

const EditButton: React.FC<Props> = ({ section, dispatchStep }) => {
  const handleClick = (): void => {
    dispatchStep({ type: 'setActive', payload: 1 });
    setTimeout(() => {
      focusAndScroll(section);
    }, 100);
  };
  const { t } = useTranslation();
  return (
    <Button
      theme="black"
      onClick={() => handleClick()}
      variant="supplementary"
      iconLeft={<IconPen />}
    >
      {t(`common:applications.actions.edit`)}
    </Button>
  );
};

export default EditButton;
