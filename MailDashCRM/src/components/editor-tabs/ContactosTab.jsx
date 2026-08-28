import React, { useMemo } from 'react';
import { Tag, User, Briefcase, Mail, Phone, Users, Megaphone, Target } from "lucide-react";
import { TIPOS_ENTIDAD, SUBTIPOS_POR_ENTIDAD, ESTADOS_CLIENTE, LISTA_BLANCA_HIERARCHY } from "../../utils/organizationUtils";
import { SectionHeader, InputField, SelectField, TextAreaField } from './EditorComponents';
import { MultiSelectField } from './MultiSelectField';

const ContactosTab = ({ data, handleChange }) => {
    const isListaBlancaNacional = String(data.estado_cliente || "") === String(ESTADOS_CLIENTE.LISTA_BLANCA_NACIONAL);
    const isListaBlancaCanarias = String(data.estado_cliente || "") === String(ESTADOS_CLIENTE.LISTA_BLANCA);

    const formatLabel = (str) => {
        if (!str) return "";
        if (str === TIPOS_ENTIDAD.SECTOR_PUBLICO_CANARIO) {
            return isListaBlancaNacional ? "Sector Público" : "Sector Público Canario";
        }

        // Special formatting for Ayuntamientos/Cabildos with island
        if (str.startsWith("cabildo ") || str.startsWith("ayuntamientos ")) {
            const isAyun = str.startsWith("ayuntamientos ");
            const prefix = isAyun ? "Ayuntamiento de" : "Cabildo de";
            const islandPart = str.replace(isAyun ? "ayuntamientos " : "cabildo ", "");
            const islandFormatted = islandPart.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            return `${prefix} ${islandFormatted}`;
        }

        const formatted = String(str)
            .replace(/_/g, ' ')
            .toLowerCase()
            .split(' ')
            .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : word))
            .join(' ');

        if (/^Contratacion Ayuntamientos$/i.test(formatted)) {
            return "Contratación Ayuntamientos";
        }

        return formatted;
    };

    // --- Lista Blanca Canarias: hierarchy-based options ---
    const editorTypeOptions = useMemo(() => {
        if (!isListaBlancaCanarias) return [];
        return Object.keys(LISTA_BLANCA_HIERARCHY);
    }, [isListaBlancaCanarias]);

    // Filter out virtual/filter-only subtypes (island-based entries used only for filtering)
    const editorSubtypeOptions = useMemo(() => {
        if (!isListaBlancaCanarias || !data.tipo_entidad) return [];
        const hierEntry = LISTA_BLANCA_HIERARCHY[data.tipo_entidad];
        if (!hierEntry) return [];
        return Object.keys(hierEntry).filter(key => {
            // Keep island-specific entries for Ayuntamientos and Cabildos in the editor
            if (data.tipo_entidad === "cabildos" && key.startsWith("cabildo ")) return true;
            if (data.tipo_entidad === "ayuntamientos" && key.startsWith("ayuntamientos ")) return true;
            
            // Filter out purely virtual/filter entries
            if (key.startsWith("todos_los_ayuntamientos")) return false;
            return true;
        });
    }, [isListaBlancaCanarias, data.tipo_entidad]);

    const editorClaseOptions = useMemo(() => {
        if (!isListaBlancaCanarias || !data.tipo_entidad) return [];
        const hierEntry = LISTA_BLANCA_HIERARCHY[data.tipo_entidad];
        if (!hierEntry) return [];

        // If a real subtipo is selected, get its clases
        if (data.sub_tipo_entidad && hierEntry[data.sub_tipo_entidad]) {
            return hierEntry[data.sub_tipo_entidad];
        }

        // If no real subtipos exist (e.g. cabildos), collect clases from all entries
        if (editorSubtypeOptions.length === 0) {
            const allClases = new Set();
            Object.values(hierEntry).forEach(clases => {
                if (Array.isArray(clases)) clases.forEach(c => allClases.add(c));
            });
            return Array.from(allClases);
        }

        return [];
    }, [isListaBlancaCanarias, data.tipo_entidad, data.sub_tipo_entidad, editorSubtypeOptions]);

    // --- Non Lista Blanca: flat subtypes ---
    const availableSubtypes = useMemo(() => {
        if (isListaBlancaCanarias) return [];
        if (!data.tipo_entidad) return [];
        if (!SUBTIPOS_POR_ENTIDAD) return [];
        
        const selectedTypes = (data.tipo_entidad || "").split(",").map(t => t.trim()).filter(Boolean);
        let allSubtypes = new Set();
        
        selectedTypes.forEach(tipo => {
            const subtypesForTipo = SUBTIPOS_POR_ENTIDAD[tipo];
            if (Array.isArray(subtypesForTipo)) {
                subtypesForTipo.forEach(st => allSubtypes.add(st));
            }
        });
        
        return Array.from(allSubtypes);
    }, [isListaBlancaCanarias, data.tipo_entidad]);

    const hasRealSubtipos = editorSubtypeOptions.length > 0;
    const hasClaseOptions = editorClaseOptions.length > 0;

    // Custom Change Handler to sync Island field
    const handleSubtipoChange = (e) => {
        const val = e.target.value;
        // 1. Trigger normal change for sub_tipo_entidad
        handleChange(e);

        // 2. Extract island and sync 'isla' field if it matches the pattern
        let extractedIsla = null;
        if (data.tipo_entidad === "cabildos" && val.startsWith("cabildo ")) {
            extractedIsla = val.replace("cabildo ", "");
        } else if (data.tipo_entidad === "ayuntamientos" && val.startsWith("ayuntamientos ")) {
            extractedIsla = val.replace("ayuntamientos ", "");
        }

        if (extractedIsla) {
            // Capitalize for the 'isla' field (e.g. "el hierro" -> "El Hierro")
            const formattedIsla = extractedIsla.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            handleChange({
                target: {
                    name: 'isla',
                    value: formattedIsla
                }
            });
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
                <SectionHeader
                    icon={Tag}
                    title="Clasificación y Contacto"
                    colorClass="text-purple-600 dark:text-purple-400"
                    bgClass="bg-purple-100 dark:bg-purple-900/30"
                />

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SelectField label="Estado Organización" name="estado_cliente"
                        value={data.estado_cliente || ""}
                        onChange={handleChange}
                        options={
                            <>
                                <option value="">Seleccionar Estado...</option>
                                <option value={ESTADOS_CLIENTE.LISTA_BLANCA}>Lista Blanca (Canarias)</option>
                                <option value={ESTADOS_CLIENTE.LISTA_NEGRA}>Lista Negra</option>
                                <option value={ESTADOS_CLIENTE.LISTA_BLANCA_NACIONAL}>Lista Blanca Nacional</option>
                                <option value={ESTADOS_CLIENTE.OTRO_TIPO}>Otro Tipo</option>
                                <option value={ESTADOS_CLIENTE.COMPETENCIA}>Competencia</option>
                                <option value={ESTADOS_CLIENTE.REVISION}>Revisión</option>
                                <option value={ESTADOS_CLIENTE.CONTACTOS_BODY}>Contactos solo body</option>
                                <option value={ESTADOS_CLIENTE.PENDIENTE}>Pendiente (Sin Clasificar)</option>
                            </>
                        }
                    />

                    {isListaBlancaCanarias ? (
                        <>
                            {/* Nivel 2: Tipo Entidad */}
                            <SelectField
                                label="Tipo de Entidad (Nivel 2)"
                                name="tipo_entidad"
                                value={data.tipo_entidad || ""}
                                onChange={handleChange}
                                options={
                                    <>
                                        <option value="">Seleccionar tipo...</option>
                                        {editorTypeOptions.map((type) => (
                                            <option key={type} value={type}>
                                                {formatLabel(type)}
                                            </option>
                                        ))}
                                    </>
                                }
                            />

                            {/* Nivel 3: Subtipo */}
                             <SelectField
                                label="Subtipo (Nivel 3)"
                                name="sub_tipo_entidad"
                                value={data.sub_tipo_entidad || ""}
                                onChange={handleSubtipoChange}
                                disabled={!data.tipo_entidad || !hasRealSubtipos}
                                options={
                                    <>
                                        <option value="">{!data.tipo_entidad ? "Selecciona un tipo primero" : !hasRealSubtipos ? "Sin subtipos disponibles" : "Seleccionar subtipo..."}</option>
                                        {editorSubtypeOptions.map((subType) => (
                                            <option key={subType} value={subType}>
                                                {formatLabel(subType)}
                                            </option>
                                        ))}
                                    </>
                                }
                            />

                            {/* Nivel 4: Clase / Cargo */}
                            <SelectField
                                label="Clase / Cargo (Nivel 4)"
                                name="clase_entidad"
                                value={data.clase_entidad || ""}
                                onChange={handleChange}
                                disabled={!data.tipo_entidad || !hasClaseOptions}
                                options={
                                    <>
                                        <option value="">{!hasClaseOptions ? "Sin clases disponibles" : "Seleccionar clase/cargo..."}</option>
                                        {editorClaseOptions.map((clase) => (
                                            <option key={clase} value={clase}>
                                                {formatLabel(clase)}
                                            </option>
                                        ))}
                                    </>
                                }
                            />
                        </>
                    ) : (
                        <>
                            <MultiSelectField label="Tipo Entidad" name="tipo_entidad"
                                value={data.tipo_entidad}
                                onChange={handleChange}
                                options={Object.values(TIPOS_ENTIDAD).map((type) => ({
                                    value: type,
                                    label: formatLabel(type)
                                }))}
                            />

                            <MultiSelectField label="Sub-tipo / Sector" name="sub_tipo_entidad"
                                value={data.sub_tipo_entidad}
                                onChange={handleChange}
                                disabled={!data.tipo_entidad}
                                options={availableSubtypes.map((subType) => ({
                                    value: subType,
                                    label: formatLabel(subType)
                                }))}
                            />

                            <InputField
                                label="Clase / Cargo"
                                name="clase_entidad"
                                value={data.clase_entidad}
                                onChange={handleChange}
                                icon={Briefcase}
                                placeholder="Ej: alcaldias, concejalias..."
                            />
                        </>
                    )}
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
                <SectionHeader
                    icon={Megaphone}
                    title="Contacto Principal (Para Campañas)"
                    colorClass="text-yellow-600 dark:text-yellow-400"
                    bgClass="bg-yellow-100 dark:bg-yellow-900/30"
                />
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
                        Este contacto se usará específicamente para el envío de campañas de email.
                    </div>
                    <InputField
                        label="Nombre del contacto principal"
                        name="nombres_org"
                        value={data.nombres_org}
                        onChange={handleChange}
                        icon={User}
                        placeholder="Ej: María García"
                    />

                    <InputField
                        label="Cargo/Rol"
                        name="rol"
                        value={data.rol}
                        onChange={handleChange}
                        icon={Briefcase}
                        placeholder="Ej: Vicepresidente Ejecutivo"
                    />

                    <InputField
                        label="Teléfono principal"
                        name="telefono"
                        value={data.telefono}
                        onChange={handleChange}
                        icon={Phone}
                        placeholder="+34 XXX XX XX XX"
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
                <SectionHeader
                    icon={Users}
                    title="Otros Contactos"
                    colorClass="text-indigo-600 dark:text-indigo-400"
                    bgClass="bg-indigo-100 dark:bg-indigo-900/30"
                />
                <div className="p-6 space-y-8">
                    <div>
                        <h4 className="mb-4 text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-gray-700 pb-2">
                            Contacto Adicional 1
                        </h4>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <InputField
                                label="Nombre completo"
                                name="contacto1_nombre"
                                placeholder="Ej: María García"
                                value={data.contacto1_nombre}
                                onChange={handleChange}
                                icon={User}
                                id="contacto1_nombre"
                            />

                            <InputField
                                label="Cargo"
                                name="contacto1_cargo"
                                placeholder="Ej: Vicepresidente Ejecutivo"
                                value={data.contacto1_cargo}
                                onChange={handleChange}
                                icon={Briefcase}
                                id="contacto1_cargo"
                            />

                            <InputField
                                label="Email"
                                name="contacto1_email"
                                placeholder="Ej: email@ejemplo.com"
                                value={data.contacto1_email}
                                onChange={handleChange}
                                icon={Mail}
                                id="contacto1_email"
                            />

                            <InputField
                                label="Teléfono"
                                name="contacto1_telefono"
                                placeholder="Ej: +34 XXX XX XX XX"
                                value={data.contacto1_telefono}
                                onChange={handleChange}
                                icon={Phone}
                                id="contacto1_telefono"
                            />
                        </div>
                    </div>

                    <div>
                        <h4 className="mb-4 text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-gray-700 pb-2">
                            Contacto Adicional 2
                        </h4>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <InputField
                                label="Nombre completo"
                                name="contacto2_nombre"
                                placeholder="Ej: María García"
                                value={data.contacto2_nombre}
                                onChange={handleChange}
                                icon={User}
                                id="contacto2_nombre"
                            />

                            <InputField
                                label="Cargo"
                                name="contacto2_cargo"
                                placeholder="Ej: Vicepresidente Ejecutivo"
                                value={data.contacto2_cargo}
                                onChange={handleChange}
                                icon={Briefcase}
                                id="contacto2_cargo"
                            />

                            <InputField
                                label="Email"
                                name="contacto2_email"
                                placeholder="Ej: email@ejemplo.com"
                                value={data.contacto2_email}
                                onChange={handleChange}
                                icon={Mail}
                                id="contacto2_email"
                            />

                            <InputField
                                label="Teléfono"
                                name="contacto2_telefono"
                                placeholder="Ej: +34 XXX XX XX XX"
                                value={data.contacto2_telefono}
                                onChange={handleChange}
                                icon={Phone}
                                id="contacto2_telefono"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
                <SectionHeader
                    icon={Target}
                    title="Temas de Interés"
                    colorClass="text-pink-600 dark:text-pink-400"
                    bgClass="bg-pink-100 dark:bg-pink-900/30"
                />
                <div className="p-6">
                    <TextAreaField
                        label="Intereses / Temas (Separados por comas)"
                        name="intereses"
                        value={data.intereses}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Ej: economia, turismo, tecnologia..."
                    />
                </div>
            </div>
        </div>
    );
};

export default ContactosTab;