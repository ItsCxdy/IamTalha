import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HERO_CONTENT } from '../../constants';

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

export default Hero;
