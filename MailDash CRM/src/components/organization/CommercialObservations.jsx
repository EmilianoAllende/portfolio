
import React, { useState, useCallback, useEffect } from "react";
import { MessageSquare, Check, X, Clock } from "lucide-react";
import apiClient from "../../api/apiClient";

const CommercialObservations = ({ selectedOrg, setSelectedOrg, setNotification, onRefresh, setConfirmProps, closeConfirm, shouldFocusContactado }) => {
  const [isEditingContactado, setIsEditingContactado] = useState(false);
  const [isEditingObservaciones, setIsEditingObservaciones] = useState(false);
  const [tempContactado, setTempContactado] = useState(selectedOrg?.contactado_estado || "no contactado");
  // Tomar último contacto real de campaigns_log
  const parseDate = (str) => {
    if (!str) return str;
    if (/\d{4}-\d{2}-\d{2}T/.test(str)) return str;
    const m = str.match(/(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})/);
    if (m) {
      return `${m[3]}-${m[2]}-${m[1]}T${m[4]}:${m[5]}:00Z`;
    }
    return str;
  };
  const getLastMailContact = useCallback((org) => {
    if (!org || !org.campaigns_log) return null;
    let log = org.campaigns_log;
    if (typeof log === 'string') {
      try { log = JSON.parse(log); } catch { return null; }
    }
    let lastDate = null;
    Object.values(log).forEach(entry => {
      if (entry && entry.last_sent) {
        if (!lastDate || new Date(parseDate(entry.last_sent)) > new Date(parseDate(lastDate))) {
          lastDate = entry.last_sent;
        }
      }
    });
    return lastDate;
  }, []);
  const [tempFechaContacto, setTempFechaContacto] = useState(getLastMailContact(selectedOrg) || "");
  const [tempObservaciones, setTempObservaciones] = useState(
    selectedOrg?.observaciones_comerciales || ""
  );
  const [isSaving, setIsSaving] = useState(false);
  const containerRef = React.useRef(null);

	// Actualizar temps cuando selectedOrg cambia
	useEffect(() => {
		if (selectedOrg) {
			setTempContactado(selectedOrg.contactado_estado || "no contactado");
			setTempFechaContacto(getLastMailContact(selectedOrg) || "");
			setTempObservaciones(selectedOrg.observaciones_comerciales || "");
			setIsEditingContactado(false);
			setIsEditingObservaciones(false);
		}
	}, [selectedOrg, getLastMailContact]);

	// Scroll suave a esta sección si viene del click en tabla
	useEffect(() => {
		if (shouldFocusContactado && containerRef.current) {
			containerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
		}
	}, [shouldFocusContactado]);

	// Formatear fecha guardado
	const formatSaveDate = (dateStr) => {
		if (!dateStr) return "No guardado";
		try {
			const date = new Date(dateStr);
			const now = new Date();
			const diffMs = now - date;
			const diffMins = Math.floor(diffMs / 60000);
			const diffHours = Math.floor(diffMs / 3600000);
			const diffDays = Math.floor(diffMs / 86400000);

			if (diffMins < 1) return "Hace menos de un minuto";
			if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? "s" : ""}`;
			if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? "s" : ""}`;
			if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? "s" : ""}`;

			return date.toLocaleDateString("es-ES", {
				year: "2-digit",
				month: "2-digit",
				day: "2-digit",
				hour: "2-digit",
				minute: "2-digit",
			});
		} catch (e) {
			return "Fecha inválida";
		}
	};

	// Guardar cambios
	const handleSave = useCallback(
		async (fieldType) => {
			console.log("🔵 handleSave llamado con fieldType:", fieldType);
			setIsSaving(true);
			try {
				const updateData = { ...selectedOrg };
				console.log("📦 updateData antes:", updateData);

				if (fieldType === "contactado") {
					updateData.contactado_estado = tempContactado;
					updateData.fecha_contacto = tempFechaContacto || "";
					updateData.fecha_contactado_modificacion = new Date().toISOString();
					console.log("✏️ Actualizando contactado_estado a:", tempContactado);
					console.log("📅 Guardando fecha_contacto:", updateData.fecha_contacto);
					console.log("⏰ Actualizando fecha_contactado_modificacion a:", updateData.fecha_contactado_modificacion);
				} else if (fieldType === "observaciones") {
					updateData.observaciones_comerciales = tempObservaciones || "[vacio]";
					updateData.fecha_observaciones_modificacion = new Date().toISOString();
					console.log("✏️ Actualizando observaciones_comerciales a:", tempObservaciones);
					console.log("⏰ Actualizando fecha_observaciones_modificacion a:", updateData.fecha_observaciones_modificacion);
				}

				// Limpiar valores vacíos (pero permitir null en contactado_estado)
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

				console.log("📦 updateData después de limpiar:", updateData);
				console.log("✅ contactado_estado final:", updateData.contactado_estado, "| tipo:", typeof updateData.contactado_estado);
				console.log("✅ observaciones_comerciales final:", updateData.observaciones_comerciales);
				console.log("✅ fecha_contacto final:", updateData.fecha_contacto);
				console.log("✅ fecha_contactado_modificacion final:", updateData.fecha_contactado_modificacion);

				// Validar que se está enviando correctamente
				const dataToSend = {
					...updateData,
					// Asegurar que contactado_estado se envía correctamente: "contactado" o "no contactado"
					contactado_estado: updateData.contactado_estado || "no contactado",
					fecha_contacto: updateData.fecha_contacto || "",
					fecha_contactado_modificacion: updateData.fecha_contactado_modificacion,
				};

				console.log("📋 dataToSend objeto completo:", JSON.stringify(dataToSend, null, 2));
				console.log("🌐 Llamando apiClient.updateOrganization...");
				const response = await apiClient.updateOrganization(dataToSend);
				console.log("✅ Respuesta del servidor:", response);

				const fieldLabel = fieldType === "contactado" ? "Estado de contacto" : "Observaciones";
				setNotification({
					type: "success",
					title: "✅ Guardado correctamente",
					message: `${fieldLabel} actualizado con éxito.`,
				});
				console.log("📢 Notificación de éxito enviada");

				// Actualizar el selectedOrg con los nuevos datos
				if (setSelectedOrg && typeof setSelectedOrg === 'function') {
					console.log("🔄 Actualizando selectedOrg con nuevos datos...");
					setSelectedOrg((prev) => ({
						...prev,
						...dataToSend,
					}));
				}

				// Recargar datos
				if (typeof onRefresh === "function") {
					console.log("🔄 Llamando onRefresh...");
					onRefresh();
				}

				// Cerrar modo edición
				if (fieldType === "contactado") {
					setIsEditingContactado(false);
				} else {
					setIsEditingObservaciones(false);
				}

				// Cerrar el modal de confirmación si existe
				if (closeConfirm && typeof closeConfirm === 'function') {
					console.log("🚪 Cerrando modal...");
					closeConfirm();
				}

				setIsSaving(false);
				console.log("✨ handleSave completado exitosamente");
			} catch (err) {
				console.error("❌ Error al guardar:", err);
				const fieldLabel = fieldType === "contactado" ? "Estado de contacto" : "Observaciones";
				setNotification({
					type: "error",
					title: "❌ Error al guardar",
					message: `No se pudieron guardar los cambios en ${fieldLabel}.`,
				});
				setIsSaving(false);
			}
		},
		[selectedOrg, tempContactado, tempObservaciones, tempFechaContacto, setNotification, onRefresh, closeConfirm, setSelectedOrg]
	);

	// Mostrar confirmación de guardar
	const showSaveConfirm = (fieldType) => {
		console.log("🔵 showSaveConfirm llamado con fieldType:", fieldType);
		console.log("📋 setConfirmProps disponible:", typeof setConfirmProps === 'function');
		
		if (!setConfirmProps || typeof setConfirmProps !== 'function') {
			console.log("⚠️ setConfirmProps no disponible, ejecutando handleSave directamente");
			handleSave(fieldType);
			return;
		}
		
		console.log("📋 Mostrando modal de confirmación");
		setConfirmProps({
			title: "Confirmar guardado",
			message: `¿Estás seguro de que deseas guardar los cambios?`,
			onConfirm: () => {
				console.log("✅ Usuario confirmó en modal");
				handleSave(fieldType);
			},
			confirmText: "Guardar",
			cancelText: "Cancelar",
		});
	};

	// Cancelar edición con confirmación
	const handleCancel = (fieldType) => {
		console.log("🔵 handleCancel llamado con fieldType:", fieldType);
		const doCancel = () => {
			console.log("🚫 Cancelando cambios...");
			if (fieldType === "contactado") {
				setTempContactado(selectedOrg?.contactado_estado || "no contactado");
				setIsEditingContactado(false);
				console.log("✏️ tempContactado reseteado a:", selectedOrg?.contactado_estado);
			} else {
				setTempObservaciones(selectedOrg?.observaciones_comerciales || "");
				setIsEditingObservaciones(false);
				console.log("✏️ tempObservaciones reseteado a:", selectedOrg?.observaciones_comerciales);
			}
		};

		if (!setConfirmProps || typeof setConfirmProps !== 'function') {
			console.log("⚠️ setConfirmProps no disponible, ejecutando doCancel directamente");
			doCancel();
			return;
		}

		console.log("📋 Mostrando modal de confirmación para cancelar");
		setConfirmProps({
			title: "Cancelar cambios",
			message: `¿Descartar los cambios no guardados?`,
			onConfirm: () => {
				console.log("✅ Usuario confirmó cancelación");
				doCancel();
				if (closeConfirm && typeof closeConfirm === 'function') {
					closeConfirm();
				}
			},
			confirmText: "Descartar",
			cancelText: "Seguir editando",
		});
	};

	return (
		<div ref={containerRef} className="flex flex-col h-full w-full p-6 bg-white rounded-2xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
			<div className="flex items-center gap-2 mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
				<MessageSquare className="w-5 h-5 text-purple-500" />
				<h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
					Observaciones Comerciales
				</h3>
			</div>

			<div className="space-y-6">
				{/* Campo Contactado */}
				<div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800/30">
					<div className="flex items-center justify-between mb-3">
						<label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
							Contacto marketing
						</label>
						{!isEditingContactado && (
							<span className="text-xs text-gray-500 dark:text-gray-400">
								<Clock className="inline w-3 h-3 mr-1" />
								{formatSaveDate(selectedOrg?.fecha_contactado_modificacion)}
							</span>
						)}
					</div>

					{isEditingContactado ? (
						<div className="flex flex-col gap-3">
							<div className="flex gap-3 items-center">
								<select
									value={tempContactado}
									onChange={(e) => setTempContactado(e.target.value)}
									className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent">
									<option value="no contactado">No contactado</option>
									<option value="contactado">Contactado</option>
								</select>
								<button
									onClick={() => showSaveConfirm("contactado")}
									disabled={isSaving}
									className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center gap-1 text-sm font-medium transition-colors">
									<Check className="w-4 h-4" />
									Guardar
								</button>
								<button
									onClick={() => handleCancel("contactado")}
									disabled={isSaving}
									className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 flex items-center gap-1 text-sm font-medium transition-colors dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
									<X className="w-4 h-4" />
									Cancelar
								</button>
							</div>
									<div className="flex flex-col gap-1">
										<label className="text-xs font-medium text-gray-600 dark:text-gray-300">Fecha último mail enviado</label>
										<input
											type="text"
											value={tempFechaContacto ? tempFechaContacto : "Sin envíos"}
											readOnly
											className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
										/>
									</div>
						</div>
					) : (
						<div className="space-y-1 w-full">
							<div className="flex items-center justify-between">
								<span className="text-sm font-medium text-gray-900 dark:text-gray-100">
									{tempContactado === "contactado"
										? "✅ Contacto marketing"
										: "⚪ No contactado"}
								</span>
								<button
									onClick={() => setIsEditingContactado(true)}
									className="px-3 py-1.5 text-xs font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/40 rounded-lg transition-colors">
									Editar
								</button>
							</div>
							<div className="text-xs text-gray-600 dark:text-gray-300">
								Fecha de contacto: {tempFechaContacto ? new Date(`${tempFechaContacto}T00:00:00Z`).toLocaleDateString("es-ES") : "Sin fecha"}
							</div>
						</div>
					)}
				</div>

				{/* Campo Observaciones */}
				<div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/30">
					<div className="flex items-center justify-between mb-3">
						<label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
							Observaciones
						</label>
						{!isEditingObservaciones && (
							<span className="text-xs text-gray-500 dark:text-gray-400">
								<Clock className="inline w-3 h-3 mr-1" />
								{formatSaveDate(selectedOrg?.fecha_observaciones_modificacion)}
							</span>
						)}
					</div>

					{isEditingObservaciones ? (
						<div className="space-y-3">
							<textarea
								value={tempObservaciones}
								onChange={(e) => setTempObservaciones(e.target.value)}
								disabled={isSaving}
								rows={4}
								placeholder="Escribe aquí tus observaciones comerciales..."
								className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
							/>
							<div className="flex gap-2">
								<button
									onClick={() => showSaveConfirm("observaciones")}
									disabled={isSaving}
									className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center gap-1 text-sm font-medium transition-colors">
									<Check className="w-4 h-4" />
									Guardar
								</button>
								<button
									onClick={() => handleCancel("observaciones")}
									disabled={isSaving}
									className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 flex items-center gap-1 text-sm font-medium transition-colors dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
									<X className="w-4 h-4" />
									Cancelar
								</button>
							</div>
						</div>
					) : (
						<div className="flex items-start justify-between">
							<div className="flex-1">
								<p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
									{tempObservaciones || (
										<span className="text-gray-400 dark:text-gray-500 italic">
											Sin observaciones
										</span>
									)}
								</p>
							</div>
							<button
								onClick={() => setIsEditingObservaciones(true)}
								className="ml-3 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors flex-shrink-0">
								Editar
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default CommercialObservations;
