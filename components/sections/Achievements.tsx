import React from 'react';
import Section from '../ui/Section';
import { ACHIEVEMENTS } from '../../constants';

const Achievements = () => {
  return (
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
  );
};

export default Achievements;
