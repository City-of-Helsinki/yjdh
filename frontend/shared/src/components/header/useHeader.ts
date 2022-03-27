import { useState } from 'react';
import { TFunction, useTranslation } from 'next-i18next';
import { HeaderProps } from 'shared/components/header/Header';
import useLocale from 'shared/hooks/useLocale';
import { Language } from 'shared/i18n/i18n';

type ExtendedComponentProps = {
  locale: Language;
  menuOpen: boolean;
  logoLang: Language;
  toggleMenu: () => void;
  closeMenu: () => void;
  handleLogin: (
    event?: React.MouseEvent<HTMLAnchorElement, MouseEvent> | undefined
  ) => void;
  handleLogout: (
    event?: React.MouseEvent<HTMLAnchorElement, MouseEvent> | undefined
  ) => void;
  t: TFunction;
};

const useHeader = (login: HeaderProps['login']): ExtendedComponentProps => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = (): void => setMenuOpen(!menuOpen);
  const closeMenu = (): void => setMenuOpen(false);

  const locale = useLocale();

  const { t } = useTranslation();

  const handleLogin = (event?: React.MouseEvent<HTMLAnchorElement>): void => {
    if (event) {
      event.preventDefault();
    }
    if (login) {
      login.onLogin();
    }
  };

  const handleLogout = (event?: React.MouseEvent<HTMLAnchorElement>): void => {
    if (event) {
      event.preventDefault();
    }
    if (login) {
      login.onLogout();
    }
  };

  const logoLang = locale === 'sv' ? 'sv' : 'fi';

  return {
    locale,
    menuOpen,
    logoLang,
    toggleMenu,
    closeMenu,
    handleLogin,
    handleLogout,
    t,
  };
};

export { useHeader };
