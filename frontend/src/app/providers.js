'use client';

import Shell from '../components/Shell/Shell'
import { Content, Theme } from '@carbon/react';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Providers({ children }) {
  const [theme, setTheme] = useState(null); 
  const shellTheme = theme === "light" ? "g10" : "g90";
  const contentTheme = theme === "light" ? "white" : "g100";

  const path = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Get theme from sessionStorage or set to system preference
      const storedTheme = sessionStorage.getItem("theme");
      const systemTheme = window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark";

      const initialTheme = storedTheme || systemTheme;
      setTheme(initialTheme); 
      sessionStorage.setItem("theme", initialTheme);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && theme) {
      sessionStorage.setItem("theme", theme); 
    }
  }, [theme]);

  function toggleTheme() {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
  }

  if (theme === null) {
    return null;
  }

  return (
    <Theme theme={contentTheme}>
      <div id="targetDiv">
        <Theme theme={shellTheme}>
          <Shell theme={theme} onToggleTheme={toggleTheme} />
        </Theme>
        <Content>{children}</Content>
      </div>
    </Theme>
  );
}