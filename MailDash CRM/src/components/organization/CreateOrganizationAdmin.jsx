import React, { useMemo, useState } from "react";
import { Building2, Save, RotateCcw } from "lucide-react";
import apiClient from "../../api/apiClient";
import InformacionBasicaTab from "../editor-tabs/InformacionBasicaTab";
import ContactosTab from "../editor-tabs/ContactosTab";
import EstadoComercialTab from "../editor-tabs/EstadoComercialTab";

const INITIAL_FORM = {
    id: "",
    nombre: "",
    organizacion: "",
    url: "",
    telefono: "",
    actividad_principal: "",
    direccion: "",
    municipio: "",
    isla: "",
    intereses: "",
    segmentacion_sugerida: "",
    estado_cliente: "",
    tipo_entidad: "",
    sub_tipo_entidad: "",
    nombres_org: "",
    rol: "",
    contacto1_nombre: "",
    contacto1_cargo: "",
    contacto1_email: "",
    contacto1_telefono: "",
    contacto2_nombre: "",
    contacto2_cargo: "",
    contacto2_email: "",
    contacto2_telefono: "",
    suscripcion: "activa",
    dias_sin_contacto: "",
    frecuencia_comunicacion: "",
    ultimo_posteo: "",
    hace_dias: "",
    url_posteo: "",
    titulo_posteo: "",
    actividad_reciente: "",
};

const CreateOrganizationAdmin = ({ setNotification }) => {
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [activeTab, setActiveTab] = useState("basica");
    const [isSaving, setIsSaving] = useState(false);

    const isFormValid = useMemo(() => {
        return (
            !!formData.id?.trim() &&
            !!(formData.organizacion?.trim() || formData.nombre?.trim()) &&
            !!formData.estado_cliente?.trim() &&
            !!formData.tipo_entidad?.trim()
        );
    }, [formData]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "estado_cliente") {
            setFormData((prev) => ({ ...prev, [name]: value, tipo_entidad: "", sub_tipo_entidad: "" }));
            return;
        }

        if (name === "tipo_entidad") {
            setFormData((prev) => ({ ...prev, [name]: value, sub_tipo_entidad: "" }));
            return;
        }

        if (name === "suscripcion") {
            if (value === "inactiva" && formData.suscripcion === "activa") {
                setFormData((prev) => ({ ...prev, [name]: value, organizacion_baja: "BAJA_MANUAL" }));
                return;
            }
            if (value === "activa" && formData.suscripcion === "inactiva") {
                setFormData((prev) => ({ ...prev, [name]: value, organizacion_baja: "ALTA_MANUAL" }));
                return;
            }
        }

        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const sanitizeForWebhook = (input) => {
        const payload = { ...input };

        Object.keys(payload).forEach((key) => {
            const value = payload[key];

            if (key === "telefono" && (value === "" || value === null || value === undefined)) {
                payload[key] = 0;
                return;
            }

            if (typeof value === "string") {
                const trimmed = value.trim();
                payload[key] = trimmed === "" ? "[vacio]" : trimmed;
            }
        });

        return payload;
    };

    const handleSubmit = async () => {
        if (!isFormValid || isSaving) return;

        setIsSaving(true);
        try {
            const payload = sanitizeForWebhook(formData);
            await apiClient.createOrganizationFromAdmin(payload);

            setNotification({
                type: "success",
                title: "Organización creada",
                message: "La organización se creó correctamente.",
            });

            setFormData(INITIAL_FORM);
            setActiveTab("basica");
        } catch (error) {
            console.error("Error al crear organización:", error);
            setNotification({
                type: "error",
                title: "Error al crear",
                message:
                    error?.response?.data?.message ||
                    "No se pudo crear la organización en este momento.",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        if (isSaving) return;
        setFormData(INITIAL_FORM);
        setActiveTab("basica");
    };

    return (
        <div className="h-full flex flex-col bg-gray-50/50 dark:bg-gray-900 transition-colors">
            <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm rounded-b-3xl">
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300">
                        <Building2 size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                            Crear Organización
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate max-w-xs sm:max-w-md">
                            Alta manual de una organización desde administración.
                        </p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={handleReset}
                        className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:text-white transition-all shadow-sm"
                    >
                        <RotateCcw size={16} />
                        Limpiar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSaving || !isFormValid}
                        className="inline-flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
                        title={!isFormValid ? "Completa ID, nombre/organización, estado y tipo" : ""}
                    >
                        <Save size={18} />
                        {isSaving ? "Creando..." : "Crear Organización"}
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
                <div className="flex border-b bg-gray-50 dark:bg-gray-900/50 dark:border-gray-700 mb-6 rounded-t-lg overflow-x-auto">
                    <button
                        onClick={() => setActiveTab("basica")}
                        className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${activeTab === "basica" ? "border-b-2 border-blue-600 text-blue-600 bg-white dark:bg-gray-800 dark:text-blue-300" : "text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"}`}
                    >
                        Información Básica
                    </button>
                    <button
                        onClick={() => setActiveTab("contactos")}
                        className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${activeTab === "contactos" ? "border-b-2 border-blue-600 text-blue-600 bg-white dark:bg-gray-800 dark:text-blue-300" : "text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"}`}
                    >
                        Clasificación y Contacto
                    </button>
                    <button
                        onClick={() => setActiveTab("comercial")}
                        className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${activeTab === "comercial" ? "border-b-2 border-blue-600 text-blue-600 bg-white dark:bg-gray-800 dark:text-blue-300" : "text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"}`}
                    >
                        Estado Comercial
                    </button>
                </div>

                {activeTab === "basica" && (
                    <InformacionBasicaTab data={formData} handleChange={handleChange} isCreateMode />
                )}
                {activeTab === "contactos" && (
                    <ContactosTab data={formData} handleChange={handleChange} />
                )}
                {activeTab === "comercial" && (
                    <EstadoComercialTab data={formData} handleChange={handleChange} />
                )}
            </div>
        </div>
    );
};

export default CreateOrganizationAdmin;