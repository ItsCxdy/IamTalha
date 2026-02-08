import React from 'react';
import Section from '../ui/Section';
import { SKILLS } from '../../constants';

const Skills = () => {
  return (
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
  );
};

export default Skills;
