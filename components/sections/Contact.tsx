import React from 'react';
import { Heart } from 'lucide-react';
import Section from '../ui/Section';
import { CTA_COPY, SOCIAL_LINKS } from '../../constants';

const Contact = () => {
  return (
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
  );
};

export default Contact;
