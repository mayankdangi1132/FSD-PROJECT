import { useState } from 'react';
import { Moon, Sun } from 'lucide-react';

// light / dark mode button.
// the starting theme is already set by a small script in index.html so the page doesn't flash white.
const ThemeToggle = () => {
  const [theme, setTheme] = useState(document.documentElement.getAttribute('data-theme') || 'light');

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem('theme', next);
    } catch (err) {
      // private mode etc. - theme just won't be remembered
    }
    setTheme(next);
  };

  return (
    <button
      className="icon-btn"
      onClick={toggleTheme}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label="Toggle dark mode"
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
};

export default ThemeToggle;
