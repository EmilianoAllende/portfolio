import React, { useState, useEffect } from "react";
import { MessageSquare, X, Save, RefreshCw } from "lucide-react";
import apiClient from "../../api/apiClient";


const CommercialObservationsModal = ({
	show,
	onClose,
	organization,
	onSaveSuccess,
	setNotification,
	setConfirmProps,
	closeConfirm,
}) => {
	const [tempObservaciones, setTempObservaciones] = useState("");
	const [tempContactado, setTempContactado] = useState("no contactado");
	const [tempFechaContacto, setTempFechaContacto] = useState("");
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		if (organization) {
			setTempObservaciones(organization.observaciones_comerciales || "");
			setTempContactado(organization.contactado_estado || "no contactado");
			setTempFechaContacto(organization.fecha_contacto || "");
		}
	}, [organization]);

	if (!show || !organization) {
		return null;
	}

	const handleSave = async () => {
		setIsSaving(true);
		try {
			const updateData = {
				...organization,
				observaciones_comerciales: tempObservaciones || "[vacio]",
				fecha_observaciones_modificacion: new Date().toISOString(),
				contactado_estado: tempContactado || "no contactado",
				fecha_contacto: tempFechaContacto || "",
				fecha_contactado_modificacion: new Date().toISOString(),
			};

			Object.keys(updateData).forEach((key) => {
				if (
					key === "telefono" &&
					(updateData[key] === "" || updateData[key] === null || updateData[key] === undefined)
				) {
					updateData[key] = 0;
				} else if (
					typeof updateData[key] === "string" &&
					updateData[key] === "" &&
					key !== "observaciones_comerciales" &&
					key !== "contactado_estado"
				) {
					updateData[key] = "[vacio]";
				}
			});

			await apiClient.updateOrganization(updateData);

			setNotification({
				type: "success",
				title: "✅ Guardado correctamente",
				message: `Observaciones y contacto marketing para ${organization.nombre || organization.organizacion} actualizados.`,
			});

			if (onSaveSuccess) {
				onSaveSuccess(updateData);
			}
			onClose();
		} catch (err) {
			console.error("❌ Error al guardar observaciones:", err);
			setNotification({
				type: "error",
				title: "❌ Error al guardar",
				message: `No se pudieron guardar los cambios.`,
			});
		} finally {
			setIsSaving(false);
		}
	};

	const showSaveConfirm = () => {
		setConfirmProps({
			title: "Confirmar guardado",
			message: `¿Estás seguro de que deseas guardar los cambios para ${organization.nombre || organization.organizacion}?`,
			onConfirm: () => {
				handleSave();
				if (closeConfirm) closeConfirm();
			},
			confirmText: "Guardar",
			cancelText: "Cancelar",
		});
	};

	return (
		<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4">
			<div
				onClick={(e) => e.stopPropagation()}
				className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl border border-slate-200 dark:border-slate-700 animate-scaleIn"
			>
				<div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
					<div className="flex items-center gap-3">
						<MessageSquare className="w-6 h-6 text-purple-500" />
						<div>
							<h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
								Observaciones Comerciales
							</h3>
							<p className="text-sm text-slate-500 dark:text-slate-400">
								Para: {organization.nombre || organization.organizacion}
							</p>
						</div>
					</div>
					<button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
						<X size={20} className="text-slate-500" />
					</button>
				</div>
				<div className="p-6 space-y-6">
					{/* Campo Contactado */}
					<div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800/30 mb-4">
						<div className="flex items-center justify-between mb-3">
							<label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
								Contacto marketing
							</label>
						</div>
						<div className="flex flex-col gap-3">
							<div className="flex gap-3 items-center">
								<select
									value={tempContactado}
									onChange={(e) => setTempContactado(e.target.value)}
									className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
								>
									<option value="no contactado">No contactado</option>
									<option value="contactado">Contactado</option>
								</select>
							</div>
							<div className="flex flex-col gap-1">
								<label className="text-xs font-medium text-gray-600 dark:text-gray-300">Fecha de contacto</label>
								<input
									type="date"
									value={tempFechaContacto ? tempFechaContacto.split('T')[0] : ""}
									onChange={(e) => setTempFechaContacto(e.target.value)}
									disabled={isSaving}
									className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
								/>
							</div>
						</div>
					</div>
					{/* Campo Observaciones */}
					<div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/30">
						<label htmlFor="observaciones-modal" className="text-sm font-medium text-slate-700 dark:text-slate-300">Editar observaciones</label>
						<textarea
							id="observaciones-modal"
							value={tempObservaciones}
							onChange={(e) => setTempObservaciones(e.target.value)}
							disabled={isSaving}
							rows={6}
							placeholder="Escribe aquí tus observaciones comerciales..."
							className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
						/>
					</div>
				</div>
				<div className="flex justify-end items-center gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 rounded-b-2xl">
					<button onClick={onClose} disabled={isSaving} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-600 disabled:opacity-50">Cancelar</button>
					<button onClick={showSaveConfirm} disabled={isSaving} className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2">
						{isSaving ? (<RefreshCw className="animate-spin h-4 w-4" />) : (<Save size={16} />)}
						{isSaving ? "Guardando..." : "Guardar Cambios"}
					</button>
				</div>
			</div>
		</div>
	);
};

export default CommercialObservationsModal;