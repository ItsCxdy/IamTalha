import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { useScrollReveal, scrollVariants } from '../../hooks/useScrollReveal';

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

export default Section;
