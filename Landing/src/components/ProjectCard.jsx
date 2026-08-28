import React from 'react';

const ProjectCard = ({ project, isLeft }) => {
  return (
    <div className={`timeline-item ${isLeft ? 'left' : 'right'}`}>
      <div className="timeline-node">
        <div className="icon-container">
          {project.icon}
        </div>
      </div>
      
      {/* Usamos un tag <a> para que toda la tarjeta sea clickeable */}
      <a href={project.url} target="_blank" rel="noopener noreferrer" className="project-card">
        <div className="project-tag">{project.tag}</div>
        <h3 className="project-title">{project.title}</h3>
        <p className="project-desc">{project.description}</p>
        
        {project.technologies && (
          <div className="flex flex-wrap gap-2 mt-4" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>
            {project.technologies.map((tech, index) => (
              <span key={index} className="tech-badge" style={{ backgroundColor: 'rgba(124, 58, 237, 0.1)', color: '#a78bfa', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '500', border: '1px solid rgba(124, 58, 237, 0.3)' }}>
                {tech}
              </span>
            ))}
          </div>
        )}
      </a>
    </div>
  );
};

export default ProjectCard;
