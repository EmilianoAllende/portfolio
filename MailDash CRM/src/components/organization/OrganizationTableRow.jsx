import React, { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { Eye, Edit, Mail, MoreVertical, Clock } from "lucide-react";

import { isRecentlyContacted, getLastMailContactDetails, formatBajaReason, formatDate } from "../../utils/organizationUtils";

const parseJsonSafe = (value, fallback = {}) => {
	if (!value) return fallback;
	if (typeof value === "object") return value;
	if (typeof value === "string") {
		try {
			return JSON.parse(value);
		} catch {
			return fallback;
		}
	}
	return fallback;
};

const BREVO_BAJA_REASON_LABELS = {
	BOUNCED: "REBOTADO",
	SOFT_BOUNCE: "SOFT BOUNCE",
	HARD_BOUNCE: "HARD BOUNCE",
	BLOCKED: "BLOQUEADO",
	UNSUBSCRIBED: "DESUSCRITO",
	SPAM: "SPAM",
	INVALID_EMAIL: "EMAIL INVÁLIDO",
	DEFERRED: "DEFERRED",
	DELIVERED: "ENTREGADO",
	SENT: "ENVIADO",
	OPENED: "ABIERTO",
	CLICKED: "CLIC",
};

const normalizeBrevoReason = (value) => {
	if (!value) return null;
	const normalized = String(value).trim().toUpperCase();
	return BREVO_BAJA_REASON_LABELS[normalized] || normalized.replace(/_/g, " ");
};

const getLatestBrevoStatusFromOrg = (org) => {
	const brevoData = parseJsonSafe(org?.brevo_data, {});
	const marketingData = parseJsonSafe(org?.marketing_data, {});
	const marketingBrevo = marketingData?.brevo_data || marketingData?.brevo || marketingData;

	const candidates = [
		org?.brevo_latest_event?.status,
		org?.brevo_latest_event?.eventType,
		org?.lastBrevoStatus,
		brevoData?.lastBrevoStatus,
		brevoData?.status,
		brevoData?.eventType,
		marketingBrevo?.lastBrevoStatus,
		marketingBrevo?.status,
		marketingBrevo?.eventType,
	];

	return candidates.find(Boolean) || null;
};

const getBajaReasonLabel = (org) => {
	const hasDbBajaReason = org?.organizacion_baja !== null
		&& org?.organizacion_baja !== undefined
		&& String(org.organizacion_baja).trim().toLowerCase() !== "null";

	if (hasDbBajaReason) {
		return formatBajaReason(org.organizacion_baja) || String(org.organizacion_baja);
	}

	if (org?.suscripcion === "inactiva") {
		const brevoStatus = getLatestBrevoStatusFromOrg(org);
		const brevoReason = normalizeBrevoReason(brevoStatus);
		if (brevoReason) return brevoReason;
	}

	return "Inactiva";
};

const CAMPAIGN_PREVIEW_MAX_LENGTH = 22;

const getCampaignPreview = (title) => {
	if (!title) return "";
	const normalized = String(title).trim();
	if (normalized.length <= CAMPAIGN_PREVIEW_MAX_LENGTH) return normalized;
	return normalized.slice(0, CAMPAIGN_PREVIEW_MAX_LENGTH).trimEnd();
};

const normalizeMMIUserValue = (value) => {
	if (value === true || value === "true" || value === 1 || value === "1") return "true";
	if (value === false || value === "false" || value === 0 || value === "0") return "false";
	return "sin_datos";
};

const getMMICoincidenceLabel = (value) => {
	const normalized = String(value || "").trim().toLowerCase();
	if (normalized === "exacta") return "Coincidencia exacta";
	if (normalized === "dominio") return "Coincidencia por dominio";
	return null;
};

const ESTADOS_CLIENTE = {
	PENDIENTE: 0,
	LISTA_BLANCA: 1,
	LISTA_NEGRA: 2,
	LISTA_BLANCA_NACIONAL: 3,
	OTRO_TIPO: 4,
	COMPETENCIA: 5,
	REVISION: 6,
	CONTACTOS_BODY: 7,
};

const getStatusColor = (estado) => {
	switch (estado) {
		case ESTADOS_CLIENTE.LISTA_BLANCA: return "bg-green-500";
		case ESTADOS_CLIENTE.LISTA_NEGRA: return "bg-red-500";
		case ESTADOS_CLIENTE.LISTA_BLANCA_NACIONAL: return "bg-blue-500";
		case ESTADOS_CLIENTE.OTRO_TIPO: return "bg-gray-500";
		case ESTADOS_CLIENTE.COMPETENCIA: return "bg-indigo-500";
		case ESTADOS_CLIENTE.REVISION: return "bg-orange-500";
		case ESTADOS_CLIENTE.CONTACTOS_BODY: return "bg-purple-500";
		case ESTADOS_CLIENTE.PENDIENTE: return "bg-yellow-400";
		default: return "bg-red-400";
	}
};



// Usar la misma lógica que en useOrganizationTableLogic

// (Nota: formatBajaReason y formatDate se mantienen locales si no se movieron, 
// pero isRecentlyContacted, getLastMailContact, parseDate vienen de utils)

const OrganizationTableRow = ({
	org,
	selected,
	handleSelectOrg,
	getDisplayContacts,
	setSelectedOrg,
	viewDetail,
	openEditModal,
	handleCampaignClick,
	showBajaReason,
	setScrollToContactado,
	selectedSenderId,
}) => {
	const { display, more } = getDisplayContacts(org);
	const email = org.id && org.id.includes('@') ? org.id : null;
	const nombreVisual = org.nombre && org.nombre !== "indefinido" ? org.nombre.replace(/"/g, '') : null;
	const sectorVisual = org.sector && org.sector !== "indefinido" ? org.sector : null;
	const [showMenu, setShowMenu] = useState(false);
	const [isCampaignExpanded, setIsCampaignExpanded] = useState(false);
	const buttonRef = useRef(null);
	const menuRef = useRef(null);
	const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
	const bajaReasonLabel = useMemo(() => getBajaReasonLabel(org), [org]);

	const lastMailContactDetails = useMemo(() => getLastMailContactDetails(org, selectedSenderId), [org, selectedSenderId]);
	const lastMailContact = lastMailContactDetails?.date || null;
	const lastMailCampaign = lastMailContactDetails?.campaignTitle || null;
	const campaignPreview = useMemo(() => getCampaignPreview(lastMailCampaign), [lastMailCampaign]);
	const shouldTruncateCampaign = useMemo(
		() => Boolean(lastMailCampaign && lastMailCampaign.trim().length > CAMPAIGN_PREVIEW_MAX_LENGTH),
		[lastMailCampaign]
	);
	const isRecentlyContactedCheck = useMemo(() => isRecentlyContacted(org, selectedSenderId), [org, selectedSenderId]);
	const mmiUserStatus = useMemo(() => normalizeMMIUserValue(org?.es_usuario_mmi), [org?.es_usuario_mmi]);
	const mmiCoincidenceLabel = useMemo(() => getMMICoincidenceLabel(org?.tipo_coincidencia_mmi), [org?.tipo_coincidencia_mmi]);
	const mmiLastAccess = useMemo(() => {
		if (!org?.fecha_ultimo_acceso_mmi) return null;
		return formatDate(org.fecha_ultimo_acceso_mmi);
	}, [org?.fecha_ultimo_acceso_mmi]);

	// Determinar si está inactiva: no suscripta o tiene baja (excepto alta manual con suscripción activa)
	const isInactive = useMemo(() => {
		// Si no está suscripta
		if (!org.suscripcion || org.suscripcion !== "activa") return true;
		// Si tiene baja pero suscripción está activa y razón es "alta manual", NO está inactiva
		if (org.organizacion_baja && org.suscripcion === "activa") {
			const bajaReason = formatBajaReason(org.organizacion_baja);
			if (bajaReason === "BAJA MANUAL" || bajaReason?.includes("MANUAL")) {
				return false; // Desbloqueada
			}
			return true;
		}
		return false;
	}, [org.organizacion_baja, org.suscripcion]);

	const isLocked = useMemo(() => isRecentlyContactedCheck || isInactive, [isRecentlyContactedCheck, isInactive]);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (menuRef.current && !menuRef.current.contains(event.target) &&
				buttonRef.current && !buttonRef.current.contains(event.target)) {
				setShowMenu(false);
			}
		};

		if (showMenu && buttonRef.current) {
			const rect = buttonRef.current.getBoundingClientRect();
			setMenuPosition({
				top: rect.bottom + window.scrollY + 8,
				left: rect.right + window.scrollX - 200,
			});
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [showMenu]);

	return (
		<tr
			onClick={() => setSelectedOrg(org)}
			className={`group transition-colors duration-150 ${selected
				? "bg-blue-50 dark:bg-blue-900/30 border-l-4 border-l-blue-500"
				: "hover:bg-gray-50 dark:hover:bg-gray-800/60 border-l-4 border-l-transparent"
				} ${isLocked ? "opacity-60 bg-gray-50 dark:bg-gray-900/40" : ""}`}>

			{/* Checkbox */}
			<td className="py-4 pl-4 pr-3 sm:pl-6 align-middle">
				<div className="flex items-center h-full">
					{isLocked ? (
						<div className="text-gray-400 dark:text-gray-500 cursor-not-allowed" title={isInactive ? "Suscripción inactiva" : "Contactado hace menos de 7 días"}>
							<Clock size={16} />
						</div>
					) : (
						<input
							type="checkbox"
							className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-500 dark:bg-gray-700 dark:checked:bg-blue-500 cursor-pointer transition-colors"
							checked={selected}
							onChange={() => {
								handleSelectOrg(org.id);
								setSelectedOrg(org);
							}}
						/>
					)}
				</div>
			</td>

			{/* Organización */}
			<td className="py-4 px-3 align-middle w-[220px] sm:w-[280px] md:w-[320px] lg:w-[380px] max-w-[380px]">
				<div className="flex items-center gap-3">
					<span
						className={`flex-shrink-0 w-2.5 h-2.5 rounded-full shadow-sm ring-1 ring-white dark:ring-slate-800 ${getStatusColor(org.estado_cliente)}`}
						title={`Estado: ${org.estado_cliente}`}
					/>
					<div className="min-w-0">
						<div className="font-medium text-gray-900 dark:text-gray-100 whitespace-normal break-words" title={org.organizacion || nombreVisual}>
							{org.organizacion || nombreVisual || "Sin nombre"}
						</div>
						<div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 whitespace-normal break-words">
							{[sectorVisual, (nombreVisual && nombreVisual !== org.organizacion) ? nombreVisual : null].filter(Boolean).join(" • ")}
						</div>
					</div>
				</div>
			</td>

			{/* Contacto */}
			<td className="py-4 px-3 align-middle text-sm w-[150px] sm:w-[200px] md:w-[250px] lg:w-[300px] max-w-[300px] overflow-hidden">
				<div className="flex flex-col gap-0.5 truncate">
					{display.map((contact, i) => (
						<div key={i} className="font-medium text-gray-900 dark:text-gray-200 truncate">
							{contact}
						</div>
					))}
					{more > 0 && (
						<div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
							+{more} otros
						</div>
					)}
					{display.length === 0 && (
						<span className="text-gray-400 dark:text-gray-600 italic">
							Sin nombre de contacto
						</span>
					)}
				</div>
			</td>

			{/* Cargo */}
			<td className="py-4 px-3 align-middle text-sm w-[150px] sm:w-[200px] md:w-[250px] lg:w-[300px] max-w-[300px] overflow-hidden">
				<div className="flex flex-col gap-0.5 truncate">
					{org.rol && org.rol !== "indefinido" ? (
						<div className="text-xs text-gray-500 dark:text-gray-400 truncate" title={org.rol.replace(/[[\]"]/g, '')}>
							{org.rol.replace(/[[\]"]/g, '')}
						</div>
					) : (
						<span className="text-gray-500 dark:text-gray-400">—</span>
					)}
				</div>
			</td>

			{/* Email / Teléfono */}
			<td className="py-4 px-3 align-middle w-[200px] sm:w-[260px] md:w-[300px] lg:w-[350px] max-w-[350px]">
				<div className="flex flex-col gap-0.5">
					{email ? (
						<a href={`mailto:${email}`} className="text-sm text-blue-600 dark:text-blue-400 hover:underline block whitespace-normal break-all" title={email}>
							{email}
						</a>
					) : (
						<span className="text-xs text-gray-400 italic">No disponible</span>
					)}
					{org.telefono && org.telefono !== "indefinido" && (
						<span className="text-xs text-gray-500 dark:text-gray-400 block whitespace-normal break-all" title={org.telefono}>
							{org.telefono}
						</span>
					)}
				</div>
			</td>

			{/* Último contacto */}
			<td className="py-4 px-3 align-middle text-gray-600 dark:text-gray-400 text-sm font-mono">
				{lastMailContact ? formatDate(lastMailContact) : "Nunca contactado"}
				{lastMailContact && lastMailCampaign && (
					<span className="block text-[10px] text-gray-500 dark:text-gray-400 mt-1 font-sans">
						Campaña: {isCampaignExpanded || !shouldTruncateCampaign ? lastMailCampaign : campaignPreview}
						{shouldTruncateCampaign && !isCampaignExpanded && (
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									setIsCampaignExpanded(true);
								}}
								className="ml-1 text-blue-600 dark:text-blue-400 hover:underline"
								title="Ver nombre completo de la campaña"
							>
								...
							</button>
						)}
						{shouldTruncateCampaign && isCampaignExpanded && (
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									setIsCampaignExpanded(false);
								}}
								className="ml-1 text-blue-600 dark:text-blue-400 hover:underline"
								title="Contraer nombre de la campaña"
							>
								↑
							</button>
						)}
					</span>
				)}
				{isRecentlyContactedCheck && !isInactive && (
					<span className="block text-[10px] text-orange-500 font-bold uppercase mt-1">
						Hace menos de 7 días
					</span>
				)}
				{isInactive && (
					<span className="block text-[10px] text-red-600 dark:text-red-400 font-bold uppercase mt-1">
						{bajaReasonLabel || "Inactiva"}
					</span>
				)}
			</td>

			<td className="py-4 px-3 align-middle text-sm min-w-[190px]">
				<div className="flex flex-col gap-1">
					<span className={`inline-flex w-fit px-2 py-0.5 rounded-full text-[11px] font-semibold ${mmiUserStatus === "true"
						? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
						: mmiUserStatus === "false"
							? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300"
							: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
					}`}>
						{mmiUserStatus === "true" ? "Sí es usuario" : mmiUserStatus === "false" ? "No es usuario" : "Sin datos"}
					</span>
					{mmiCoincidenceLabel && (
						<span className="text-[11px] text-gray-600 dark:text-gray-400">
							{mmiCoincidenceLabel}
						</span>
					)}
					<span className="text-[11px] text-gray-500 dark:text-gray-400">
						Últ. acceso MMI: {mmiLastAccess || "Sin datos"}
					</span>
				</div>
			</td>

			{/* Contacto marketing */}
			<td className="py-3 px-3 align-middle text-sm">
				<div
					className="flex flex-col gap-0.5 cursor-pointer hover:opacity-80 transition-opacity"
					onClick={(e) => {
						e.stopPropagation();
						setSelectedOrg(org);
						if (setScrollToContactado) setScrollToContactado(true);
						viewDetail(org);
					}}
					role="button"
					tabIndex={0}
					title="Click para editar contacto marketing"
				>
					<span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium ${org.contactado_estado === "contactado"
						? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300"
						: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
						}`}>
						{org.contactado_estado === "contactado" ? "✅ Contactado" : "⚪ No contactado"}
					</span>
					{org.contactado_estado === "contactado" && org.fecha_contacto && (
						<span className="text-[10px] text-gray-600 dark:text-gray-400">
							Fecha de contacto: {formatDate(org.fecha_contacto) || ""}
						</span>
					)}
				</div>
			</td>

			{/* Razón de Baja */}
			{showBajaReason && (
				<td className="py-4 px-3 align-middle text-sm">
					<span className="inline-block px-3 py-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-full text-xs font-medium">
						{bajaReasonLabel || "Inactiva"}
					</span>
				</td>
			)}
			<td className="py-4 px-3 align-middle text-right">
				<button
					ref={buttonRef}
					onClick={(e) => {
						e.stopPropagation();
						setShowMenu(!showMenu);
					}}
					className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors focus:outline-none"
				>
					<MoreVertical size={20} />
				</button>

				{showMenu && createPortal(
					<div
						ref={menuRef}
						className="w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-[50000] animate-fadeIn"
						style={{
							position: 'fixed',
							top: `${menuPosition.top}px`,
							left: `${menuPosition.left}px`,
						}}
					>
						<div className="py-1" role="menu">
							<button
								onClick={(e) => {
									e.stopPropagation();
									setSelectedOrg(org);
									viewDetail(org);
									setShowMenu(false);
								}}
								className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 cursor-pointer transition-colors"
								title="Ver detalles de la organización"
							>
								<Eye size={16} className="text-blue-500" /> Ver detalles
							</button>

							<button
								onClick={(e) => {
									e.stopPropagation();
									setSelectedOrg(org);
									openEditModal(org);
									setShowMenu(false);
								}}
								className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 cursor-pointer transition-colors"
								title="Editar organización"
							>
								<Edit size={16} className="text-indigo-500" /> Editar
							</button>

							<button
								onClick={(e) => {
									e.stopPropagation();
									if (!isLocked && !isInactive) {
										handleCampaignClick(org);
									}
									setShowMenu(false);
								}}
								className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors ${isLocked || isInactive
									? "text-gray-400 dark:text-gray-500 cursor-not-allowed"
									: "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
									}`}
								title={isInactive ? "Organización inactiva" : isRecentlyContactedCheck ? "Bloqueado: contactado hace menos de 7 días" : "Enviar campaña a esta organización"}
							>
								<Mail size={16} className={isLocked || isInactive ? "text-gray-400" : "text-green-500"} /> Enviar campaña
							</button>
						</div>
					</div>,
					document.body
				)}
			</td>
		</tr>
	);
};

export default OrganizationTableRow;
