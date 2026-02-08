import React from 'react';
import Section from '../ui/Section';
import { EXPERIENCE } from '../../constants';

const Experience = () => {
  return (
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
  );
};

export default Experience;
