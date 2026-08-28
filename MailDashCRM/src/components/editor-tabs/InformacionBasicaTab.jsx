import React from 'react';
import {
    Building, MapPin, Lock, Globe, Phone,
    NotebookTextIcon
} from "lucide-react";
import { ESTADOS_CLIENTE, PROVINCIAS_ESPANA } from "../../utils/organizationUtils";
import { SectionHeader, InputField, SelectField, TextAreaField } from './EditorComponents';

const InformacionBasicaTab = ({ data, handleChange, isCreateMode = false }) => {
    const isListaBlancaNacional = String(data.estado_cliente || "") === String(ESTADOS_CLIENTE.LISTA_BLANCA_NACIONAL);
    const ubicaciones = isListaBlancaNacional
        ? PROVINCIAS_ESPANA
        : [
            "Gran Canaria",
            "Tenerife",
            "Lanzarote",
            "Fuerteventura",
            "La Palma",
            "La Gomera",
            "El Hierro",
        ];

    return (
    <div className="space-y-6">
        {/* DATOS GENERALES */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
            <SectionHeader
                icon={Building}
                title="Información General"
                colorClass="text-blue-600 dark:text-blue-400"
                bgClass="bg-blue-100 dark:bg-blue-900/30"
            />

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="col-span-1 md:col-span-2">
                    <InputField
                        label="subnombre"
                        name="nombre"
                        value={data.nombre}
                        onChange={handleChange}
                        placeholder="Nombre visible de la ficha"
                        className="col-span-2"
                    />
                </div>

                <div className="col-span-1">
                    <InputField
                        label="Nombre de la Organización (Legal/Entidad)"
                        name="organizacion"
                        value={data.organizacion}
                        onChange={handleChange}
                        placeholder="Nombre de la entidad"
                    />
                </div>

                <InputField
                    label="Email (ID)"
                    name="id"
                    value={data.id}
                    onChange={handleChange}
                    icon={Lock}
                    disabled={!isCreateMode}
                    title={isCreateMode ? "Ingresa el email único de la organización" : "El ID es único y no se puede modificar"}
                />

                <InputField
                    label="Sitio Web"
                    name="url"
                    value={data.url}
                    onChange={handleChange}
                    icon={Globe}
                    placeholder="https://www.ejemplo.com"
                />

                <InputField
                    label="Teléfono"
                    name="telefono"
                    value={data.telefono}
                    onChange={handleChange}
                    icon={Phone}
                    placeholder="+34..."
                />

                <div className="col-span-1 md:col-span-2">
                    <InputField
                        label="Actividad principal"
                        name="actividad_principal"
                        value={data.actividad_principal}
                        onChange={handleChange}
                    />
                </div>
            </div>
        </div>

        {/* UBICACIÓN */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
            <SectionHeader
                icon={MapPin}
                title="Ubicación"
                colorClass="text-green-600 dark:text-green-400"
                bgClass="bg-green-100 dark:bg-green-900/30"
            />

            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-3">
                    <InputField
                        label="Dirección Completa"
                        name="direccion"
                        value={data.direccion}
                        onChange={handleChange}
                        placeholder="Calle, Número..."
                    />
                </div>

                <InputField
                    label="Municipio"
                    name="municipio"
                    value={data.municipio}
                    onChange={handleChange}
                />

                <SelectField label={isListaBlancaNacional ? "Provincia" : "Isla"} name="isla"
                    value={data.isla}
                    onChange={handleChange}
                    options={
                        <>
                            <option value="">Seleccionar...</option>
                            {ubicaciones.map((ubicacion) => (
                                <option key={ubicacion} value={ubicacion}>{ubicacion}</option>
                            ))}
                        </>
                    }
                />
            </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
            <SectionHeader
                icon={NotebookTextIcon}
                title="Metadatos"
                colorClass="text-blue-600 dark:text-blue-400"
                bgClass="bg-blue-100 dark:bg-blue-900/30"
            />

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <TextAreaField
                    label="Intereses principales"
                    name="intereses"
                    value={data.intereses}
                    onChange={handleChange}
                    rows={2}
                    placeholder="economía, empleo, competitividad..."
                />

                <TextAreaField
                    label="Segmentación sugerida"
                    name="segmentacion_sugerida"
                    value={data.segmentacion_sugerida}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Empresarios, Medios de comunicación..."
                />
            </div>
        </div>
    </div>
);
};

export default InformacionBasicaTab;