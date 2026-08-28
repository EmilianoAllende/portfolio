import { useState, useEffect, useCallback } from "react";
import apiClient from "../api/apiClient";

const CACHE_KEY = "matching_cache";
const CACHE_EXPIRATION_MS = 3 * 60 * 60 * 1000; // 3 horas

const sanitizeMatching = (payload) => {
	const list = Array.isArray(payload)
		? payload
		: Array.isArray(payload?.data)
			? payload.data
			: Array.isArray(payload?.items)
				? payload.items
				: [];

	return list.map((item) => ({
		id: item.id,
		created_at: item.created_at ?? item.createdAt ?? null,
		cliente_id: item.cliente_id ?? "",
		nombre_cliente: item.nombre_cliente ?? item.nombre ?? "",
		ultimo_posteo_info: item.ultimo_posteo_info ?? "",
		escenario: item.escenario ?? "",
		resumen_noticia: item.resumen_noticia ?? "",
		cita_texto: item.cita_texto ?? "",
		noticia_original: item.noticia_original ?? null,
		estado: item.estado ?? "",
	}));
};

export const useMatchingData = (isAuthenticated, setNotification) => {
	const [matching, setMatching] = useState(() => {
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

	const [isLoading, setIsLoading] = useState(matching.length === 0);
	const [error, setError] = useState(null);

	const fetchMatching = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const response = await apiClient.getMatching();
			const data = sanitizeMatching(response.data);
			const cache = { data, timestamp: new Date().getTime() };
			localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
			setMatching(data);
			setLastRefreshTs(cache.timestamp);
		} catch (err) {
			setError(err);
			setNotification?.({
				type: "error",
				title: "Error de Conexión",
				message: "No se pudo cargar matching.",
			});
		} finally {
			setIsLoading(false);
		}
	}, [setNotification]);

	const refreshMatching = useCallback(() => {
		localStorage.removeItem(CACHE_KEY);
		setMatching([]);
		setLastRefreshTs(null);
		fetchMatching();
	}, [fetchMatching]);

	useEffect(() => {
		if (isAuthenticated && matching.length === 0) {
			fetchMatching();
		}
	}, [isAuthenticated, matching.length, fetchMatching]);

	return {
		matching,
		isMatchingLoading: isLoading,
		matchingError: error,
		lastMatchingRefreshTs: lastRefreshTs,
		refreshMatching,
	};
};
