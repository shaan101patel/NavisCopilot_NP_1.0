import React, { useEffect, useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import NavisLogoLight from '../assets/NavisLogo_LightMode-removebg-preview.png';
import NavisLogoDark from '../assets/NavisLogo_DarkMode-removebg-preview.png';

/**
 * A component that displays the correct logo based on the current theme
 * This component automatically updates when the theme changes
 */
export function LogoDisplay() {
  const { resolvedTheme } = useTheme();
  const [logoSrc, setLogoSrc] = useState(() => {
    // Initialize with the correct logo based on current theme
    return resolvedTheme === 'dark' ? NavisLogoDark : NavisLogoLight;
  });
  const [renderKey, setRenderKey] = useState(0);
  
  useEffect(() => {
    const newLogoSrc = resolvedTheme === 'dark' ? NavisLogoDark : NavisLogoLight;
    
    // Only update if the logo actually needs to change
    if (newLogoSrc !== logoSrc) {
      setLogoSrc(newLogoSrc);
      setRenderKey(prev => prev + 1); // Force re-render
      console.log('LogoDisplay: Theme changed to', resolvedTheme, 'Logo:', newLogoSrc);
    }
  }, [resolvedTheme, logoSrc]);
  
  return (
    <img 
      key={`logo-${renderKey}`}
      src={logoSrc}
      alt="Navis Logo" 
      className="h-8 w-auto object-contain"
      onError={(e) => {
        console.error('Logo failed to load:', e.currentTarget.src);
      }}
      onLoad={() => {
        console.log('Logo loaded successfully for theme:', resolvedTheme);
      }}
    />
  );
}
