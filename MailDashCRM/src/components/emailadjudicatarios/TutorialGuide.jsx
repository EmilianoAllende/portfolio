import React, { useState, useEffect } from "react";
import { X, ChevronRight, ChevronLeft, HelpCircle } from "lucide-react";

export const TutorialGuideButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold
               bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300
               border border-indigo-500/30 transition-all active:scale-95"
    title="Iniciar Tutorial Interacto"
  >
    <HelpCircle size={16} />
    <span>Guía</span>
  </button>
);

const TutorialGuide = ({ steps, isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setTargetRect(null);
      // Quitar clase de body si se usara
      return;
    }

    const step = steps[currentStep];
    if (!step || !step.targetId) {
      setTargetRect(null);
      return;
    }

    // Pequeño delay para asegurar renderizado, y un resize listener
    const updateRect = () => {
      const el = document.getElementById(step.targetId);
      if (el) {
        const rect = el.getBoundingClientRect();
        // Agregamos padding virtual de 8px
        setTargetRect({
          top: rect.top - 8,
          left: rect.left - 8,
          width: rect.width + 16,
          height: rect.height + 16,
        });
        
        // Ensure element is somewhat in view
        el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
      } else {
        setTargetRect(null);
      }
    };

    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect);
    
    // Observers para mutaciones (si un componente cambia de tamaño)
    const observer = new MutationObserver(updateRect);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });

    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect);
      observer.disconnect();
    };
  }, [isOpen, currentStep, steps]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep((p) => p + 1);
    else onClose();
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep((p) => p - 1);
  };

  const step = steps[currentStep];

  // Clip Path para crear el "agujero" en el overlay de blur/oscuro
  const holeClipPath = targetRect 
    ? `polygon(0% 0%, 0% 100%, 100% 100%, 100% 0%, 0% 0%, ${targetRect.left}px ${targetRect.top}px, ${targetRect.left + targetRect.width}px ${targetRect.top}px, ${targetRect.left + targetRect.width}px ${targetRect.top + targetRect.height}px, ${targetRect.left}px ${targetRect.top + targetRect.height}px, ${targetRect.left}px ${targetRect.top}px)`
    : "none";

  // Cálculo de posición del Popover
  let popoverTop = "50%";
  let popoverLeft = "50%";
  let transform = "translate(-50%, -50%)";

  if (targetRect) {
    // Intentar ubicar abajo del target
    const spaceBelow = window.innerHeight - (targetRect.top + targetRect.height);
    const spaceAbove = targetRect.top;
    
    if (spaceBelow > 300) {
      popoverTop = `${targetRect.top + targetRect.height + 16}px`;
      popoverLeft = `${Math.min(
        Math.max(targetRect.left + targetRect.width / 2, 200),
        window.innerWidth - 200
      )}px`;
      transform = "translateX(-50%)";
    } else if (spaceAbove > 300) {
      popoverTop = `${targetRect.top - 16}px`;
      popoverLeft = `${Math.min(
        Math.max(targetRect.left + targetRect.width / 2, 200),
        window.innerWidth - 200
      )}px`;
      transform = "translate(-50%, -100%)";
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none" style={{ transition: 'all 0.3s ease-in-out' }}>
      {/* Fondo oscuro general con blur */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm pointer-events-auto transition-all duration-300"
        style={{ clipPath: holeClipPath }}
        onClick={onClose}
      />

      {/* Recorte o Marco luminoso sobre el componente objetivo */}
      {targetRect && (
        <div
          className="absolute rounded-xl ring-2 ring-indigo-500 shadow-[0_0_0_9999px_rgba(15,23,42,0.7),0_0_30px_rgba(99,102,241,0.4)] pointer-events-none transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{
            top: targetRect.top,
            left: targetRect.left,
            width: targetRect.width,
            height: targetRect.height,
            boxShadow: "0 0 0 9999px rgba(15, 23, 42, 0.5), 0 0 30px rgba(99, 102, 241, 0.4)", // Sobre-escribe para evitar parpadeos
            // Este truco permite hacer "agujeros" donde el usuario sí puede ver nítido si controlamos el z-index de los hijos, pero aquí es suficiente con el marco.
          }}
        />
      )}

      {/* Popover de contenido */}
      <div
        className="absolute w-full max-w-sm pointer-events-auto transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{
          top: popoverTop,
          left: popoverLeft,
          transform: transform,
        }}
      >
        <div className="bg-slate-800 rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.8)] border border-slate-700 overflow-hidden ring-1 ring-white/10">
          <div className="h-1 w-full bg-gradient-to-r from-indigo-500 to-purple-500" />
          
          <div className="p-5">
            <div className="flex justify-between items-start mb-3">
              <div className="flex gap-2 items-center">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold border border-indigo-500/30">
                  {currentStep + 1}
                </span>
                <h3 className="text-base font-bold text-slate-100">{step.title}</h3>
              </div>
              <button 
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors"
                title="Cerrar Guía"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="text-sm text-slate-300 leading-relaxed mb-5 whitespace-pre-line">
              {step.content}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-700/60">
              <span className="text-xs font-medium text-slate-500">
                Paso {currentStep + 1} de {steps.length}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={handleNext}
                  className="flex items-center gap-1 pl-3 pr-2 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 transition-colors"
                >
                  {currentStep === steps.length - 1 ? "Finalizar" : "Siguiente"}
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialGuide;
