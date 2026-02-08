import { useRef } from 'react';
import { useInView, UseInViewOptions, Variants } from 'framer-motion';

export const useScrollReveal = (margin?: UseInViewOptions['margin']) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: margin || '-100px' });

  return { ref, isInView };
};

// Predefined animation variants
export const scrollVariants: Record<string, Variants> = {
  floatUp: {
    initial: { 
      opacity: 0, 
      y: 40, 
      filter: 'blur(4px)',
    },
    animate: { 
      opacity: 1, 
      y: 0, 
      filter: 'blur(0px)',
    },
  },
  staggerContainer: {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  },
};
