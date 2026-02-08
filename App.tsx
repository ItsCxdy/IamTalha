import React, { useState, useEffect, Suspense } from 'react';
import Header from './components/layout/Header';
import Hero from './components/sections/Hero';
import About from './components/sections/About';
import Experience from './components/sections/Experience';
import Projects from './components/sections/Projects';
import Achievements from './components/sections/Achievements';
import Certifications from './components/sections/Certifications';
import Skills from './components/sections/Skills';
import Contact from './components/sections/Contact';

// Lazy load the heavy background component
const FluidBackground = React.lazy(() => import('./components/Background'));

export default function App() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    setMounted(true);
    // Initialize theme based on HTML class or system preference could go here
    if (document.documentElement.classList.contains('dark')) {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background text-primary selection:bg-accent/20 selection:text-accent relative overflow-x-hidden transition-colors duration-300">
      
      {/* 1. Global Animated Background - Key forces remount on theme change */}
      <Suspense fallback={<div className="fixed inset-0 z-[1] bg-background"></div>}>
        <FluidBackground key={theme} theme={theme} />
      </Suspense>
      
      <Header theme={theme} toggleTheme={toggleTheme} />
      
      <main className="relative z-10">
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Achievements />
        <Certifications />
        <Skills />
        <Contact />
      </main>
    </div>
  );
}
