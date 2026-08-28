// src/hooks/useOrganizationData.js
import { useState, useCallback, useEffect } from "react";
import apiClient from "../api/apiClient"; // Asegúrate de que este archivo exista

const CACHE_EXPIRATION_MS = 3 * 60 * 60 * 1000; // 3 horas

export const useOrganizationData = (
	isAuthenticated,
	setNotification,
	fetchTemplates
) => {
	// Data
	const [organizaciones, setOrganizaciones] = useState(() => {
		try {
			const cachedData = localStorage.getItem("organizaciones_cache");
			if (!cachedData) return [];
			const { data, timestamp } = JSON.parse(cachedData);
			const isExpired = new Date().getTime() - CACHE_EXPIRATION_MS > timestamp;
			return isExpired ? [] : data;
		} catch (error) {
			return [];
		}
	});
	const [lastRefreshTs, setLastRefreshTs] = useState(() => {
		try {
			const cachedData = localStorage.getItem("organizaciones_cache");
			if (!cachedData) return null;
			const { timestamp } = JSON.parse(cachedData);
			const isExpired = new Date().getTime() - CACHE_EXPIRATION_MS > timestamp;
			return isExpired ? null : timestamp;
		} catch (e) {
			return null;
		}
	});

	// Loading & Error
	const [isLoading, setIsLoading] = useState(organizaciones.length === 0);
	const [error, setError] = useState(null);
	const [isSaving, setIsSaving] = useState(false);

	// Lógica de Carga Inicial
	const fetchOrganizaciones = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		let fetchResult = {
			ok: false,
			count: 0,
			error: null,
		};
		try {
			const baseUrl = (apiClient?.defaults?.baseURL || "").replace(/\/+$/, "");
			const endpoint = "/webhook/organization-list";
			console.log("🌐 [Métricas Usuario] API consultada para organizaciones:", `${baseUrl}${endpoint}`);
			const response = await apiClient.getOrganizaciones();
			console.log("✅ [Métricas Usuario] Organizaciones recibidas:", Array.isArray(response?.data) ? response.data.length : 0);
			console.log("📦 [Métricas Usuario] Payload completo de la API:", response?.data);
			console.log(
				"🔎 [Métricas Usuario] Muestra (primeras 3 organizaciones):",
				Array.isArray(response?.data) ? response.data.slice(0, 3) : response?.data
			);
			const cache = {
				data: response.data,
				timestamp: new Date().getTime(),
			};
			try {
				localStorage.setItem("organizaciones_cache", JSON.stringify(cache));
			} catch (e) {
				// Si es error de quota, limpiar y reintentar una vez
				if (e && e.name === 'QuotaExceededError') {
					localStorage.removeItem("organizaciones_cache");
					try {
						localStorage.setItem("organizaciones_cache", JSON.stringify(cache));
					} catch (e2) {
						// Si vuelve a fallar, no guardar y continuar
					}
				}
			}
			setOrganizaciones(response.data);
			setLastRefreshTs(cache.timestamp);
			fetchResult = {
				ok: true,
				count: Array.isArray(response?.data) ? response.data.length : 0,
				error: null,
			};
		} catch (err) {
			setError(err);
			fetchResult = {
				ok: false,
				count: 0,
				error: err,
			};
			setNotification({
				type: "error",
				title: "Error de Conexión",
				message: "No se pudieron cargar los datos de las organizaciones.",
			});
		} finally {
			setIsLoading(false);
			setNotification(
				fetchResult.ok
					? {
						type: "success",
						title: "Búsqueda finalizada",
						message: `Se terminó la búsqueda de organizaciones. Se encontraron ${fetchResult.count} registros.`,
					}
					: {
						type: "warning",
						title: "Búsqueda finalizada",
						message: "La búsqueda de organizaciones terminó, pero la base de datos no respondió correctamente.",
					}
			);
		}

		return fetchResult;
	}, [setNotification]);

	// Data Refresh (Coordina la recarga de Organizaciones y Plantillas)
	const handleRefresh = useCallback(async () => {
		localStorage.removeItem("organizaciones_cache");
		setLastRefreshTs(null);
		const result = await fetchOrganizaciones();
		fetchTemplates(); // Llama a la función del hook de campañas
		return result;
	}, [fetchOrganizaciones, fetchTemplates]);

	// Efecto de Carga Inicial para Organizaciones
	useEffect(() => {
		if (isAuthenticated && organizaciones.length === 0) {
			fetchOrganizaciones();
		}
	}, [isAuthenticated, organizaciones.length, fetchOrganizaciones]);

	return {
		organizaciones,
		setOrganizaciones,
		lastRefreshTs,
		setLastRefreshTs,
		isLoading,
		setIsLoading,
		error,
		setError,
		isSaving,
		setIsSaving,
		handleRefresh,
	};
};
