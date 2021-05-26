
import { useState } from 'react'

const useComponent = (locale: string, onNavigationItemClick?: (pathname: string) => void) => {
  
  const [menuOpen, setMenuOpen] = useState(false);
  
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  const isTabActive = (pathname: string): boolean => {
    return (
      typeof window !== 'undefined' &&
      window.location.pathname.startsWith(pathname)
    );
  };

  const handleNavigationItemClick = (pathname: string) => (
    event?: React.MouseEvent<HTMLAnchorElement>
  ) => {
    event?.preventDefault();
    onNavigationItemClick && onNavigationItemClick(pathname);
  };
  

  const logoLang = locale === 'sv' ? 'sv' : 'fi';

  return { menuOpen, logoLang, toggleMenu, closeMenu, isTabActive, handleNavigationItemClick }
}

export { useComponent }