import { useTranslation } from '../../../i18n';

const useComponent = () => {

  const { t } = useTranslation();
  
  const handleMoreInfoClick = () => {};

  return { handleMoreInfoClick, t }
}

export { useComponent }