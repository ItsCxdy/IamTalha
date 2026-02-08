import React from 'react';
import Section from '../ui/Section';
import { ABOUT_CONTENT } from '../../constants';

const About = () => {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-surface/50 pointer-events-none -z-10 opacity-50" />
      <Section title="about" id="about">
        <p className="text-lg md:text-xl leading-relaxed text-secondary/90">
          {ABOUT_CONTENT}
        </p>
      </Section>
    </div>
  );
};

export default About;
