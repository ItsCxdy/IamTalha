import React from 'react';
import Section from '../ui/Section';
import { CERTIFICATIONS } from '../../constants';

const Certifications = () => {
  return (
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
  );
};

export default Certifications;
