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
      </a>
    </div>
  );
};

export default ProjectCard;
