// src/hooks/useUI.js
import { useState, useCallback } from "react";
// 1. IMPORTA ESTO (Asegúrate de que la ruta sea correcta)
import { ESTADOS_CLIENTE } from "../utils/organizationUtils"; 

export const useUI = () => {
	// UI
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
	const [activeView, setActiveView] = useState("listado");
	const [selectedOrg, setSelectedOrg] = useState(null);

	// Modals & Notifications
	const [showCampaignModal, setShowCampaignModal] = useState(false);
	const [notification, setNotification] = useState(null);
	const [confirmProps, setConfirmProps] = useState({
		show: false,
		title: "",
		message: "",
		onConfirm: () => {},
		confirmText: "Confirmar",
		type: "info",
	});

	// Filters
	// 2. CAMBIA ESTO: De "todos" a la constante de Lista Blanca
	const [filterStatus, setFilterStatus] = useState(ESTADOS_CLIENTE.LISTA_BLANCA);
	
	const [filterType, setFilterType] = useState("todos");
	const [filterComunidad, setFilterComunidad] = useState("todos");
	const [filterIsla, setFilterIsla] = useState("todos");
	const [filterMunicipio, setFilterMunicipio] = useState([]);
	
	// Filtro de suscripción: por defecto solo se muestran las suscritas
	const [filterSuscripcion, setFilterSuscripcion] = useState("activa");
	const [filterUsuarioMMI, setFilterUsuarioMMI] = useState("todos");
	
	const [filterLicita, setFilterLicita] = useState("todos");
	const [filterFrecuencia, setFilterFrecuencia] = useState("todas");
	
	const [currentPage, setCurrentPage] = useState(1);
	const [scrollToContactado, setScrollToContactado] = useState(false);

	// Función mejorada para establecer props del modal de confirmación
	const handleSetConfirmProps = useCallback((props) => {
		console.log("📋 handleSetConfirmProps llamado con:", props);
		setConfirmProps((prev) => ({
			...prev,
			...props,
			show: true, // Asegurar que el modal se muestre
		}));
	}, []);

	const closeConfirm = useCallback(() => {
		console.log("🚪 closeConfirm llamado");
		setConfirmProps((prev) => ({
			...prev,
			show: false,
			title: "",
			message: "",
			onConfirm: () => {},
		}));
	}, []);

	// Helper para cambiar de vista y seleccionar organización simultáneamente
	const setViewAndOrg = useCallback((view, org) => {
		setActiveView(view);
		setSelectedOrg(org);
	}, []);

	return {
		// State
		isSidebarCollapsed,
		activeView,
		selectedOrg,
		showCampaignModal,
		notification,
		confirmProps,
		filterStatus,
		filterType,
		filterComunidad,
		filterIsla,
		filterMunicipio,
		filterSuscripcion,
		filterUsuarioMMI,
		filterLicita,
		filterFrecuencia,
		currentPage,
		scrollToContactado,
		// Setters
		setIsSidebarCollapsed,
		setActiveView,
		setSelectedOrg,
		setShowCampaignModal,
		setNotification,
		setConfirmProps: handleSetConfirmProps,
		setFilterStatus,
		setFilterType,
		setFilterComunidad,
		setFilterIsla,
		setFilterMunicipio,
		setFilterSuscripcion,
		setFilterUsuarioMMI,
		setFilterLicita,
		setFilterFrecuencia,
		setCurrentPage,
		setScrollToContactado,
		// Handlers
		closeConfirm,
		setViewAndOrg,
	};
};