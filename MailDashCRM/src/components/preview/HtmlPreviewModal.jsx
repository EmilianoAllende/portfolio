import { X } from "lucide-react";

const HtmlPreviewModal = ({ htmlContent, onClose, selectedOrg, subject, senderEmail, senderName }) => {
  // Lógica de visualización más robusta
  const recipientName = (() => {
    // 1. Intenta usar 'nombre', si existe y NO es "indefinido", "undefined" o "ninguno"
    if (selectedOrg?.nombre && 
        selectedOrg.nombre !== "indefinido" && 
        selectedOrg.nombre !== "undefined" &&
        selectedOrg.nombre !== "ninguno") {
      return selectedOrg.nombre;
    }
    // 2. Intenta usar 'nombres_org', si existe y NO es "indefinido", "undefined" o "ninguno"
    if (selectedOrg?.nombres_org && 
        selectedOrg.nombres_org !== "indefinido" && 
        selectedOrg.nombres_org !== "undefined" &&
        selectedOrg.nombres_org !== "ninguno") {
      return selectedOrg.nombres_org.replace(/[[\]"]/g, ''); // Quita [" "] si existen
    }
    // 3. Intenta usar 'organizacion', si existe y NO es "indefinido", "undefined" o "ninguno"
    if (selectedOrg?.organizacion && 
        selectedOrg.organizacion !== "indefinido" && 
        selectedOrg.organizacion !== "undefined" &&
        selectedOrg.organizacion !== "ninguno") {
      return selectedOrg.organizacion;
    }
    // 4. Como último recurso, usa el ID
    return selectedOrg?.id || "Sin Destinatario";
  })();

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/25 backdrop-blur-sm p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-gradient-to-b from-slate-100/90 to-white/95 dark:from-slate-800/95 dark:to-slate-900/90 rounded-2xl shadow-2xl w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700 animate-scaleIn transition-all duration-300 ease-out"
      >
        {/* --- Header --- */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-600 bg-slate-50/80 dark:bg-slate-700/70 backdrop-blur-md">
          <h3 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-slate-100">
            Vista previa del correo
          </h3>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-600/40"
          >
            <X size={22} />
          </button>
        </div>

        {/* --- Información del destinatario --- */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-600 text-sm bg-white/80 dark:bg-slate-700/60 backdrop-blur-sm">
          <div className="flex flex-wrap gap-y-1 text-slate-700 dark:text-slate-300">
            <span className="font-medium w-16">De:</span>
            <span>
              {senderName && <span className="font-semibold text-slate-900 dark:text-white">{senderName}</span>}
              {senderName && " <"}
              {senderEmail}
              {senderName && ">"}
            </span>
          </div>
          <div className="flex flex-wrap gap-y-1 text-slate-700 dark:text-slate-300 mt-1">
            <span className="font-medium w-16">Para:</span>
            
            {/* --- AQUÍ ESTÁ EL CAMBIO --- */}
            <span className="font-semibold text-slate-900 dark:text-white">
              {recipientName}
            </span>
            {/* --------------------------- */}

            <span className="text-slate-500 dark:text-slate-400 ml-1">
              {selectedOrg?.id}
            </span>
          </div>

          {/* --- Asunto --- */}
          <div className="flex flex-wrap gap-y-1 text-slate-700 dark:text-slate-300 mt-2">
            <span className="font-medium w-16">Asunto:</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {subject || "Sin asunto"}
            </span>
          </div>
        </div>

        {/* --- Contenido --- */}
        <div className="flex-1 bg-gradient-to-b from-slate-100/80 to-slate-50/80 dark:from-slate-100/40 dark:to-slate-800/60 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-400/40 dark:scrollbar-thumb-slate-600/50 scrollbar-track-transparent transition-all flex justify-center items-start p-10">
          <div className="bg-white dark:bg-slate-300 w-full max-w-2xl rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-auto">
            <iframe
              srcDoc={htmlContent}
              title="Vista Previa del Email"
              className="w-full border-none bg-white dark:bg-slate-300"
              style={{
                border: "none",
                margin: 0,
                padding: 0,
                display: "block",
                minHeight: "500px",
              }}
              onLoad={(e) => {
                try {
                  const iframeDoc = e.target.contentDocument || e.target.contentWindow.document;
                  if (iframeDoc && iframeDoc.body) {
                    const height = iframeDoc.body.scrollHeight;
                    e.target.style.height = (height + 20) + "px";
                  }
                } catch (err) {
                  console.log("No se pudo ajustar altura del iframe (posible CORS)");
                }
              }}
            />
          </div>
        </div>

        {/* --- Footer --- */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-600 bg-white/90 dark:bg-slate-700/60 flex justify-end backdrop-blur-md">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-100 border border-slate-300 dark:border-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200"
          >
            Cerrar vista previa
          </button>
        </div>
      </div>
    </div>
  );
};

export default HtmlPreviewModal;