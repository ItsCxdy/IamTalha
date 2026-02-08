import React from 'react';
import Section from '../ui/Section';
import { PROJECTS } from '../../constants';

const Projects = () => {
  return (
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
  );
};

export default Projects;
