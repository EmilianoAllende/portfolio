import { useState, useEffect, useCallback } from "react";
import apiClient from "../api/apiClient";

const CACHE_KEY = "menciones_cache";
const CACHE_EXPIRATION_MS = 3 * 60 * 60 * 1000; // 3 horas

const sanitizeMenciones = (payload) => {
	const list = Array.isArray(payload)
		? payload
		: Array.isArray(payload?.data)
			? payload.data
			: Array.isArray(payload?.items)
				? payload.items
				: [];

	return list.map((item) => ({
		id: item.id,
		nombre_entidad: item.nombre_entidad ?? item.name ?? "",
		cita_clave: item.cita_clave ?? item.quote ?? "",
		razon_relevancia: item.razon_relevancia ?? item.reason ?? "",
		fecha_registro: item.fecha_registro ?? item.createdAt ?? item.updatedAt ?? null,
		conteo_historico: item.conteo_historico ?? item.count ?? null,
		mencion_hoy: Boolean(item.mencion_hoy),
		cargo: item.cargo ?? "",
		id_rollo: item.id_rollo,
	}));
};

export const useMentionsData = (isAuthenticated, setNotification) => {
	const [menciones, setMenciones] = useState(() => {
		try {
			const cached = localStorage.getItem(CACHE_KEY);
			if (!cached) return [];
			const { data, timestamp } = JSON.parse(cached);
			const isExpired = new Date().getTime() - CACHE_EXPIRATION_MS > timestamp;
			return isExpired ? [] : data;
		} catch (error) {
			return [];
		}
	});

	const [lastRefreshTs, setLastRefreshTs] = useState(() => {
		try {
			const cached = localStorage.getItem(CACHE_KEY);
			if (!cached) return null;
			const { timestamp } = JSON.parse(cached);
			const isExpired = new Date().getTime() - CACHE_EXPIRATION_MS > timestamp;
			return isExpired ? null : timestamp;
		} catch (error) {
			return null;
		}
	});

	const [isLoading, setIsLoading] = useState(menciones.length === 0);
	const [error, setError] = useState(null);

	const fetchMenciones = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const response = await apiClient.getMenciones();
			const data = sanitizeMenciones(response.data);
			const cache = { data, timestamp: new Date().getTime() };
			localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
			setMenciones(data);
			setLastRefreshTs(cache.timestamp);
		} catch (err) {
			setError(err);
			setNotification?.({
				type: "error",
				title: "Error de Conexión",
				message: "No se pudieron cargar las menciones.",
			});
		} finally {
			setIsLoading(false);
		}
	}, [setNotification]);

	const refreshMenciones = useCallback(() => {
		localStorage.removeItem(CACHE_KEY);
		setMenciones([]);
		setLastRefreshTs(null);
		fetchMenciones();
	}, [fetchMenciones]);

	useEffect(() => {
		if (isAuthenticated && menciones.length === 0) {
			fetchMenciones();
		}
	}, [isAuthenticated, menciones.length, fetchMenciones]);

	return {
		menciones,
		isMentionsLoading: isLoading,
		mentionsError: error,
		lastMentionsRefreshTs: lastRefreshTs,
		refreshMenciones,
	};
};
