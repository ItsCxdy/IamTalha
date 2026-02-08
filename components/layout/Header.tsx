import React, { useState, memo } from 'react';
import { Sun, Moon, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

// Navbar - Memoized
const Header = memo(({ theme, toggleTheme }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    setIsMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navLinks = [
    { id: 'about', label: 'About' },
    { id: 'experience', label: 'Exp' },
    { id: 'projects', label: 'Projects' },
    { id: 'achievements', label: 'Awards' },
    { id: 'certifications', label: 'Certs' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <span 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="font-mono text-sm font-bold tracking-tighter text-primary cursor-pointer"
        >
          i am Talha Ovais
        </span>
        
        <div className="flex items-center gap-6">
          {/* Desktop Nav */}
          <div className="hidden md:flex gap-6 text-sm text-secondary font-medium">
            {navLinks.map((link) => (
              <button 
                key={link.id} 
                onClick={() => scrollTo(link.id)} 
                className="hover:text-primary transition-colors focus-visible:outline-accent"
              >
                {link.label}
              </button>
            ))}
          </div>
          
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-surface transition-colors text-primary"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-primary hover:bg-surface rounded-md"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden bg-background border-t border-border mt-4"
          >
            <div className="flex flex-col py-4 gap-4">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollTo(link.id)}
                  className="text-left px-4 py-2 text-secondary hover:text-primary hover:bg-surface/50 transition-colors font-medium"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
});

Header.displayName = 'Header';

export default Header;
