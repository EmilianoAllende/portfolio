import React, { useState, useEffect, useMemo } from "react";
import PropTypes from 'prop-types';
import {
    ArrowLeft, Save,
    // eslint-disable-next-line no-unused-vars
    AlertTriangle
} from "lucide-react";
// import { TIPOS_ENTIDAD, SUBTIPOS_POR_ENTIDAD, ESTADOS_CLIENTE } from "../../utils/organizationUtils";
// import { SectionHeader } from './EditorComponents';
import InformacionBasicaTab from './InformacionBasicaTab';
import ContactosTab from './ContactosTab';
import EstadoComercialTab from './EstadoComercialTab';

// --- COMPONENTE PRINCIPAL ---
const ContactEditor = ({ selectedOrg, onSave, onCancel, isSaving, onBack }) => {
    const [formData, setFormData] = useState({});
    const [originalData, setOriginalData] = useState({});
    const [activeTab, setActiveTab] = useState('basica');

    // --- LÓGICA DE CARGA ---
    useEffect(() => {
        if (selectedOrg) {
            const processedData = { ...selectedOrg };

            Object.keys(processedData).forEach(key => {
                let val = processedData[key];
                if (typeof val === 'string') {
                    // Si viene como "\"Texto\"", lo convertimos a "Texto"
                    if (val.startsWith('"') && val.endsWith('"')) {
                        processedData[key] = val.slice(1, -1);
                    }
                }
            });

            // Procesamiento de 'intereses': Prioridad Root > Metadata > Fallback
            // Primero aseguramos que si no hay en root, intentamos sacar de metadata
            if (!processedData.intereses && processedData.metadata) {
                try {
                    const parsedMeta = typeof processedData.metadata === 'string'
                        ? JSON.parse(processedData.metadata)
                        : processedData.metadata;
                    if (parsedMeta.intereses) {
                        processedData.intereses = parsedMeta.intereses;
                    }
                } catch (e) { console.warn("Error parsing metadata for intereses fallback", e); }
            }

            ['intereses', 'nombres_org'].forEach(field => {
                const val = processedData[field];
                if (typeof val === 'string' && val.startsWith('[')) {
                    try {
                        const parsed = JSON.parse(val);
                        if (Array.isArray(parsed)) {
                            processedData[field] = parsed.join(', ');
                        }
                    } catch (e) { }
                } else if (Array.isArray(val)) {
                    // Si ya viene como array (por ejemplo desde metadata parseado), lo convertimos a string
                    processedData[field] = val.join(', ');
                }
            });

            if (typeof processedData.rol === 'string' && processedData.rol.startsWith('[')) {
                try {
                    const parsedRol = JSON.parse(processedData.rol);
                    if (Array.isArray(parsedRol) && parsedRol.length > 0) {
                        processedData.rol = parsedRol[0];
                    } else if (Array.isArray(parsedRol) && parsedRol.length === 0) {
                        processedData.rol = "";
                    }
                } catch (e) { }
            }

            // Lógica de Segmentación Sugerida (Prioridad: Root > Metadata > Fallback)
            if (!processedData.segmentacion_sugerida) {
                // Intentar leer de metadata si no existe en root
                try {
                    if (processedData.metadata) {
                        const parsedMeta = typeof processedData.metadata === 'string'
                            ? JSON.parse(processedData.metadata)
                            : processedData.metadata;

                        if (parsedMeta.segmentacion_sugerida) {
                            processedData.segmentacion_sugerida = Array.isArray(parsedMeta.segmentacion_sugerida)
                                ? parsedMeta.segmentacion_sugerida.join(', ')
                                : parsedMeta.segmentacion_sugerida;
                        } else if (parsedMeta.segmentacion) {
                            processedData.segmentacion_sugerida = Array.isArray(parsedMeta.segmentacion)
                                ? parsedMeta.segmentacion.join(', ')
                                : parsedMeta.segmentacion;
                        }
                    }
                } catch (e) { console.warn("Error parsing metadata for segmentation", e); }
            } else {
                // Si existe en root, asegurar que sea string legible (si viene como JSON string o Array)
                if (typeof processedData.segmentacion_sugerida === 'string' && processedData.segmentacion_sugerida.startsWith('[')) {
                    try {
                        const parsed = JSON.parse(processedData.segmentacion_sugerida);
                        if (Array.isArray(parsed)) {
                            processedData.segmentacion_sugerida = parsed.join(', ');
                        }
                    } catch (e) { }
                } else if (Array.isArray(processedData.segmentacion_sugerida)) {
                    processedData.segmentacion_sugerida = processedData.segmentacion_sugerida.join(', ');
                }
            }

            setFormData(processedData);
            setOriginalData(processedData);
        }
    }, [selectedOrg]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "suscripcion") {
            // Si cambia de activa a inactiva → BAJA_MANUAL
            if (value === "inactiva" && formData.suscripcion === "activa") {
                setFormData(prev => ({ ...prev, [name]: value, organizacion_baja: "BAJA_MANUAL" }));
            }
            // Si cambia de inactiva a activa → ALTA_MANUAL
            else if (value === "activa" && formData.suscripcion === "inactiva") {
                setFormData(prev => ({ ...prev, [name]: value, organizacion_baja: "ALTA_MANUAL" }));
            } else {
                setFormData(prev => ({ ...prev, [name]: value }));
            }
        } else {
            // Actualizar el campo sin limpiar niveles inferiores
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (typeof onSave === 'function') {
            onSave(formData);
        } else {
            console.error("ContactEditor: La prop 'onSave' no está definida o no es una función.");
        }
    };

    // Validación: solo requiere estado_cliente (nivel 1)
    const isFormValid = useMemo(() => {
        return !(!formData.estado_cliente || formData.estado_cliente === "");
    }, [formData.estado_cliente]);

    // Detectar si hay cambios en el formulario
    const hasChanges = useMemo(() => {
        return JSON.stringify(formData) !== JSON.stringify(originalData);
    }, [formData, originalData]);

    if (!formData.id && !formData.nombre && !formData.organizacion) return null;

    return (
        <div className="h-full flex flex-col bg-gray-50/50 dark:bg-gray-900 transition-colors">
            {/* --- CABECERA --- */}
            <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm rounded-b-3xl">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack || onCancel}
                        className="p-2 -ml-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white transition-all"
                        title="Volver atrás"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                            Editar Organización
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate max-w-xs sm:max-w-md">
                            {formData.organizacion || formData.nombre || "Nueva Organización"}
                        </p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:text-white transition-all shadow-sm"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSaving || !isFormValid || !hasChanges}
                        className="inline-flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
                        title={
                            !isFormValid
                                ? "Debes seleccionar Estado, Tipo y Subtipo"
                                : !hasChanges
                                    ? "No hay cambios para guardar"
                                    : ""
                        }
                    >
                        <Save size={18} />
                        {isSaving ? "Guardando..." : "Guardar Cambios"}
                    </button>
                </div>
            </div>

            {/* --- CUERPO --- */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">

                {/* --- NAVEGACIÓN DE PESTAÑAS --- */}
                <div className="flex border-b bg-gray-50 dark:bg-gray-900/50 dark:border-gray-700 mb-6 rounded-t-lg overflow-x-auto">

                    <button
                        onClick={() => setActiveTab('basica')}
                        className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 'basica' ? 'border-b-2 border-blue-600 text-blue-600 bg-white dark:bg-gray-800 dark:text-blue-300' : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'}`}
                    >
                        Información Básica
                    </button>
                    <button
                        onClick={() => setActiveTab('contactos')}
                        className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 'contactos' ? 'border-b-2 border-blue-600 text-blue-600 bg-white dark:bg-gray-800 dark:text-blue-300' : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'}`}
                    >
                        Clasificación y Contacto
                    </button>
                    <button
                        onClick={() => setActiveTab('comercial')}
                        className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 'comercial' ? 'border-b-2 border-blue-600 text-blue-600 bg-white dark:bg-gray-800 dark:text-blue-300' : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'}`}
                    >
                        Estado Comercial
                    </button>
                </div>

                {/* VISTAS HISTÓRICAS */}
                {activeTab === 'basica' && <InformacionBasicaTab data={formData} handleChange={handleChange} />}
                {activeTab === 'contactos' && <ContactosTab data={formData} handleChange={handleChange} />}
                {activeTab === 'comercial' && <EstadoComercialTab data={formData} handleChange={handleChange} />}
            </div>


        </div>
    );
};

ContactEditor.propTypes = {
    selectedOrg: PropTypes.object,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func,
    isSaving: PropTypes.bool,
    onBack: PropTypes.func
};

export default ContactEditor;