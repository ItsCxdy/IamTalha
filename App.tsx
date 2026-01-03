import React, { useState, useEffect, Suspense, memo } from 'react';
import { Sun, Moon, Menu, X, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { HERO_CONTENT, PROJECTS, EXPERIENCE, SKILLS, ACHIEVEMENTS, CERTIFICATIONS, ABOUT_CONTENT, SOCIAL_LINKS, CTA_COPY } from './constants';
import { useScrollReveal, scrollVariants } from './use-scroll-reveal';

// Lazy load the heavy background component
const FluidBackground = React.lazy(() => import('./AnimatedBackground'));

interface SectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

// Reusable Section Component with Scroll Reveal - Memoized for performance
const Section = memo(({ title, children, className = "", id = "" }: SectionProps) => {
  const { ref, isInView } = useScrollReveal();

  return (
    <section id={id} ref={ref} className={`py-20 px-6 md:px-12 max-w-5xl mx-auto relative ${className}`}>
      <motion.div
        initial="initial"
        animate={isInView ? "animate" : "initial"}
        variants={scrollVariants.floatUp}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        {title && <h2 className="text-2xl font-mono text-secondary mb-12 tracking-tight">./{title}</h2>}
        {children}
      </motion.div>
    </section>
  );
});

Section.displayName = 'Section';

// Navbar - Memoized
const NavBar = memo(({ theme, toggleTheme }: { theme: 'dark' | 'light', toggleTheme: () => void }) => {
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

NavBar.displayName = 'NavBar';

const FloatingDots = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <style>{`
        @keyframes float-up-down {
          0%, 100% { transform: translateY(0); opacity: 0.2; }
          50% { transform: translateY(-20px); opacity: 0.6; }
        }
      `}</style>
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute bg-surface/20 rounded-full"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 4 + 2}px`,
            height: `${Math.random() * 4 + 2}px`,
            animation: `float-up-down ${Math.random() * 5 + 5}s infinite ease-in-out`,
            animationDelay: `${Math.random() * 5}s`
          }}
        />
      ))}
    </div>
  );
};

const Hero = () => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const roles = ["AI Engineer", "Automation Specialist", "Systems Architect"];

  // Typing effect logic
  useEffect(() => {
    const role = roles[currentIndex % roles.length];
    let charIndex = 0;
    
    const typingInterval = setInterval(() => {
      if (charIndex <= role.length) {
        setDisplayedText(role.substring(0, charIndex));
        charIndex++;
      } else {
        clearInterval(typingInterval);
        setTimeout(() => {
          setCurrentIndex((prev) => prev + 1);
        }, 2000); // Pause before next role
      }
    }, 150); // Typing speed (150ms per character)

    return () => clearInterval(typingInterval);
  }, [currentIndex]);

  return (
    <section className="relative min-h-screen flex flex-col justify-center px-6 md:px-12 max-w-5xl mx-auto pt-20 overflow-hidden">
      {/* Section Specific Background Gradients - Adjusted for both themes via opacity */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[800px] pointer-events-none z-[-1]"
           style={{ background: 'radial-gradient(circle at 50% 50%, var(--accent-color), transparent 60%)', opacity: 0.1 }} />
      
      <FloatingDots />

      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <p className="font-mono text-accent mb-4">Hi, I'm</p>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-primary">{HERO_CONTENT.name}</h1>
        </motion.div>

        {/* Typing animation container */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="h-10 md:h-12 mb-8"
        >
          <h2 className="text-2xl md:text-3xl text-secondary">
            {displayedText}
            <span className="animate-pulse">|</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <p className="text-xl md:text-2xl text-secondary/80 max-w-2xl leading-relaxed">
            {HERO_CONTENT.tagline}
          </p>
        </motion.div>
      </div>
    </section>
  );
};

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
      
      <NavBar theme={theme} toggleTheme={toggleTheme} />
      
      <main className="relative z-10">
        <Hero />
        
        {/* About Section with specific gradient */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-surface/50 pointer-events-none -z-10 opacity-50" />
          <Section title="about" id="about">
            <p className="text-lg md:text-xl leading-relaxed text-secondary/90">
              {ABOUT_CONTENT}
            </p>
          </Section>
        </div>

        <Section title="experience" id="experience">
          <div className="space-y-12">
            {EXPERIENCE.map((exp) => (
              <div key={exp.id} className="group relative border-l border-border pl-8 md:pl-12 hover:border-accent/50 transition-colors duration-300">
                <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-background border border-border group-hover:border-accent transition-colors"></div>
                <div className="flex flex-col md:flex-row md:items-baseline md:justify-between mb-2">
                  <h3 className="text-xl font-semibold text-primary">{exp.role}</h3>
                  <span className="font-mono text-sm text-secondary">{exp.period}</span>
                </div>
                <p className="text-secondary mb-4">{exp.company}</p>
                <ul className="list-disc list-outside ml-4 space-y-2 text-secondary/80">
                  {exp.description.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        <Section title="projects" id="projects">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PROJECTS.map((project) => (
              <div key={project.id} className="p-6 border border-border rounded-lg hover:border-accent/30 hover:bg-surface/50 transition-all duration-300 bg-surface/30 backdrop-blur-sm shadow-sm hover:shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-primary">{project.title}</h3>
                  {project.highlight && <span className="px-2 py-1 text-xs font-mono bg-accent/10 text-accent rounded">Featured</span>}
                </div>
                <p className="text-sm font-mono text-secondary mb-4">{project.subtitle}</p>
                <p className="text-secondary/80 mb-6 text-sm leading-relaxed">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 text-xs text-secondary bg-background border border-border rounded shadow-sm">{tag}</span>
                  ))}
                </div>
                {project.githubUrl && (
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-mono text-accent hover:underline inline-flex items-center gap-1">
                    View Code {'->'}
                  </a>
                )}
              </div>
            ))}
          </div>
        </Section>

        <Section title="achievements" id="achievements">
          <div className="space-y-6">
            {ACHIEVEMENTS.map((achievement) => (
              <div key={achievement.id} className="p-6 border border-border rounded-lg bg-surface/20 backdrop-blur-sm hover:border-accent/40 transition-colors">
                 <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-2">
                    <h3 className="text-lg font-semibold text-primary">{achievement.title}</h3>
                    <span className="text-sm font-mono text-accent">{achievement.date}</span>
                 </div>
                 <p className="text-secondary/90 text-sm leading-relaxed">{achievement.description}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="certifications" id="certifications">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {CERTIFICATIONS.map((cert) => (
              <div key={cert.id} className="p-5 border border-border/50 rounded-lg bg-surface/10 hover:bg-surface/30 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-base font-semibold text-primary">{cert.title}</h3>
                  <span className="text-xs font-mono text-secondary whitespace-nowrap ml-4">{cert.date}</span>
                </div>
                <p className="text-sm text-accent mb-2">{cert.issuer}</p>
                <p className="text-xs text-secondary/80 leading-relaxed">{cert.description}</p>
              </div>
            ))}
           </div>
        </Section>

        <Section title="skills" id="skills">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {SKILLS.map((group) => (
              <div key={group.category}>
                <h3 className="text-lg font-medium mb-4 text-primary">{group.category}</h3>
                <div className="flex flex-wrap gap-2">
                  {group.skills.map(skill => (
                    <span key={skill} className="px-3 py-1.5 text-sm border border-border rounded-md text-secondary/80 hover:text-primary hover:border-border transition-colors bg-surface/40">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="contact" className="pb-20" id="contact">
          <h3 className="text-3xl md:text-4xl font-bold mb-8 max-w-2xl text-primary">
            {CTA_COPY}
          </h3>
          <div className="flex gap-6 mb-20">
            {SOCIAL_LINKS.map(link => (
              <a 
                key={link.platform} 
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary hover:text-accent transition-colors font-mono text-sm uppercase tracking-wider"
              >
                {link.platform}
              </a>
            ))}
          </div>
          
          <div className="pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-secondary/60">
            <div className="flex items-center gap-2">
              Made <Heart size={14} className="fill-accent text-accent" /> with by Mohd Talha Ovais
            </div>
            <div className="font-mono text-xs">
              Copyright © 2026 All rights reserved
            </div>
          </div>
        </Section>
      </main>
    </div>
  );
}