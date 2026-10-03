import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Ensures window scroll is immediately reset to (0, 0) upon route transitions.
 * Eliminates the issue where navigating to a tool leaves the viewport scrolled to the bottom.
 */
export const ScrollToTop: React.FC = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Reset window and document scroll immediately
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' as ScrollBehavior,
    });

    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }
  }, [pathname, search]);

  return null;
};
