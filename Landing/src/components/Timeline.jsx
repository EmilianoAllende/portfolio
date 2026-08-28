import React from 'react';
import ProjectCard from './ProjectCard';
import { Bot, Mail, MonitorPlay, Film, Calculator, Building, Code } from 'lucide-react';

const projects = [
  {
    id: 1,
    tag: 'MÓDULO 1',
    title: 'Landing Page Estática',
    description: 'Mi primer proyecto integrador. Una landing page estática demostrando fundamentos sólidos en HTML y CSS puro, maquetación semántica y diseño responsivo.',
    icon: <Code size={20} />,
    url: 'https://proymod1.netlify.app'
  },
  {
    id: 2,
    tag: 'MÓDULO 2',
    title: 'Movies Tracker (Front & Back)',
    description: 'Aplicación web interactiva para buscar y gestionar películas. Frontend dinámico con JavaScript vainilla y un backend robusto para manejar la información.',
    icon: <Film size={20} />,
    url: 'https://proymod2.netlify.app'
  },
  {
    id: 3,
    tag: 'MÓDULO 3',
    title: 'Gestor de Turnos',
    description: 'Sistema completo con autenticación y base de datos para la gestión de turnos, construido integrando React en el frontend y Node.js en el backend.',
    icon: <Calculator size={20} />,
    url: 'https://proymod3.netlify.app'
  },
  {
    id: 4,
    tag: 'MÓDULO 4',
    title: 'E-Commerce Frontend',
    description: 'Desarrollo de una interfaz de tienda en línea moderna utilizando React (Next.js), gestión de estado global y optimización de rendimiento.',
    icon: <MonitorPlay size={20} />,
    url: 'https://proymod4.netlify.app'
  },
  {
    id: 5,
    tag: 'PROYECTO FINAL',
    title: 'Proyecto Integrador Full Stack',
    description: 'La culminación del bootcamp. Una aplicación completa a nivel de producción, con arquitectura escalable, seguridad, despliegue en la nube y diseño responsivo.',
    icon: <Building size={20} />,
    url: 'https://proyectofinal.netlify.app'
  },
  {
    id: 6,
    tag: 'EXPERIENCIA LABORAL',
    title: 'MailDash CRM',
    description: 'Panel de administración enfocado en el enriquecimiento de datos y automatización de correos electrónicos. Integración compleja de APIs y flujos automatizados.',
    icon: <Mail size={20} />,
    url: 'https://maildashcrm.netlify.app'
  },
  {
    id: 7,
    tag: 'EXPERIENCIA LABORAL',
    title: 'SmartBot AI',
    description: 'Asistente técnico virtual potenciado por IA para orientar a usuarios sobre infraestructuras. Cuenta con manejo de contexto e integración de flujos de chatbot.',
    icon: <Bot size={20} />,
    url: 'https://smartbotai.netlify.app'
  }
];

const Timeline = () => {
  return (
    <div className="timeline">
      {projects.map((project, index) => (
        <ProjectCard 
          key={project.id} 
          project={project} 
          isLeft={index % 2 === 0} 
        />
      ))}
    </div>
  );
};

export default Timeline;
