import { TrendingUp, AppWindow, Info, Calendar, Clock, Link, FileText } from "lucide-react";
import { SectionHeader, InputField, SelectField, TextAreaField } from './EditorComponents';

const EstadoComercialTab = ({ data, handleChange }) => (
    <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
            <SectionHeader
                icon={TrendingUp}
                title="Estado comercial"
                colorClass="text-orange-600 dark:text-orange-400"
                bgClass="bg-orange-100 dark:bg-orange-900/30"
            />
            <div className="p-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                <SelectField
                    label="Estado del cliente"
                    name="estado_cliente"
                    value={data.estado_cliente}
                    onChange={handleChange}
                    options={
                        <>
                            <option value="">Seleccionar</option>
                            <option value="1">Cliente</option>
                            <option value="2">Prospecto</option>
                            <option value="3">Lead</option>
                        </>
                    }
                />

                <SelectField
                    label="Suscripción"
                    name="suscripcion"
                    value={data.suscripcion}
                    onChange={handleChange}
                    options={
                        <>
                            <option value="activa">Activa</option>
                            <option value="inactiva">Inactiva</option>
                        </>
                    }
                />

                <InputField
                    label="Días sin contacto"
                    name="dias_sin_contacto"
                    type="number"
                    value={data.dias_sin_contacto}
                    onChange={handleChange}
                    min="0"
                    icon={Clock}
                />

                <SelectField
                    label="Frecuencia de comunicación"
                    name="frecuencia_comunicacion"
                    value={data.frecuencia_comunicacion}
                    onChange={handleChange}
                    options={
                        <>
                            <option value="">Seleccionar</option>
                            <option value="Muy Alta">Muy Alta</option>
                            <option value="Alta">Alta</option>
                            <option value="Media">Media</option>
                            <option value="Baja">Baja</option>
                        </>
                    }
                />
            </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
            <SectionHeader
                icon={AppWindow}
                title="Actividad reciente"
                colorClass="text-green-600 dark:text-green-400"
                bgClass="bg-green-100 dark:bg-green-900/30"
            />
            <div className="p-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                <InputField
                    label="Fecha último posteo"
                    name="ultimo_posteo"
                    type="date"
                    value={data.ultimo_posteo}
                    onChange={handleChange}
                    icon={Calendar}
                />

                <InputField
                    label="Hace días (última interacción)"
                    name="hace_dias"
                    type="number"
                    value={data.hace_dias}
                    onChange={handleChange}
                    placeholder="Número de días"
                    min="0"
                    icon={Clock}
                />

                <div className="col-span-2">
                    <InputField
                        label="URL del último posteo"
                        name="url_posteo"
                        type="url"
                        value={data.url_posteo}
                        onChange={handleChange}
                        placeholder="https://..."
                        icon={Link}
                    />
                </div>

                <div className="col-span-2">
                    <TextAreaField
                        label="Título del último posteo"
                        name="titulo_posteo"
                        value={data.titulo_posteo}
                        onChange={handleChange}
                        rows={2}
                        icon={FileText}
                    />
                </div>

                <div className="col-span-2">
                    <TextAreaField
                        label="Actividad reciente"
                        name="actividad_reciente"
                        value={data.actividad_reciente}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Describe la última actividad o interacción..."
                    />
                </div>
            </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
            <SectionHeader
                icon={Info}
                title="Resumen del estado actual"
                colorClass="text-gray-600 dark:text-gray-400"
                bgClass="bg-gray-100 dark:bg-gray-800"
            />
            <div className="p-6 space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Estado del cliente</span>
                    <span className={`text-sm font-bold px-3 py-1 rounded-full ${data.estado_cliente === '1' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        data.estado_cliente === '2' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            data.estado_cliente === '3' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                        {data.estado_cliente === '1' ? 'Cliente' : data.estado_cliente === '2' ? 'Prospecto' : data.estado_cliente === '3' ? 'Lead' : 'No definido'}
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                        <span className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Días sin contacto</span>
                        <span className="block text-sm font-semibold text-gray-900 dark:text-white">
                            {data.dias_sin_contacto || 'No registrado'}
                        </span>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                        <span className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Última interacción</span>
                        <span className="block text-sm font-semibold text-gray-900 dark:text-white">
                            {data.hace_dias ? `Hace ${data.hace_dias} días` : 'No registrada'}
                        </span>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                        <span className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Frecuencia</span>
                        <span className="block text-sm font-semibold text-gray-900 dark:text-white">
                            {data.frecuencia_comunicacion || 'No definida'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export default EstadoComercialTab;