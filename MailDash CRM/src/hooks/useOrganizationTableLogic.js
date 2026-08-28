// src/hooks/useOrganizationTableLogic.js
import { useMemo, useCallback } from "react";
import { isRecentlyContacted } from "../utils/organizationUtils";

/**
 * Hook para manejar la lógica de la tabla de organizaciones
 */
export const useOrganizationTableLogic = ({
	filteredOrgs,
	currentPage,
	ITEMS_PER_PAGE,
	selectedOrgIds,
	setSelectedOrgIds,
	selectedSenderId,
}) => {
	// 1. Lógica de Paginación (Obtiene todas las orgs de la página actual)
	const paginatedOrgs = useMemo(() => {
		const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
		const endIndex = startIndex + ITEMS_PER_PAGE;
		return filteredOrgs.slice(startIndex, endIndex);
	}, [filteredOrgs, currentPage, ITEMS_PER_PAGE]);

	// 2. Lógica de Selección (MODIFICADA)
	// Calculamos los IDs "seleccionables" de esta página.
	// Excluimos las que han sido contactadas hace menos de 7 días, filtrando por el remitente seleccionado.
	const paginatedOrgIds = useMemo(
	  () =>
	    new Set(
	      paginatedOrgs
	        .filter((org) => !isRecentlyContacted(org, selectedSenderId)) // Ahora filtra por el último mail real de este remitente
	        .map((org) => org.id)
	    ),
	  [paginatedOrgs, selectedSenderId]
	);

	// Verificamos si todas las organizaciones *elegibles* de esta página están seleccionadas
	const areAllOnPageSelected =
		paginatedOrgIds.size > 0 &&
		[...paginatedOrgIds].every((id) => selectedOrgIds.has(id));

	// Manejador del checkbox "Seleccionar todo"
	const handleSelectAll = useCallback(() => {
		setSelectedOrgIds((prevSelected) => {
			const newSelected = new Set(prevSelected);
			if (areAllOnPageSelected) {
				// Si ya están todas seleccionadas, las quitamos
				paginatedOrgIds.forEach((id) => newSelected.delete(id));
			} else {
				// Si faltan algunas, agregamos SOLO las elegibles (filtradas arriba)
				paginatedOrgIds.forEach((id) => newSelected.add(id));
			}
			return newSelected;
		});
	}, [areAllOnPageSelected, paginatedOrgIds, setSelectedOrgIds]);

	// Manejador de selección individual
	const handleSelectOrg = useCallback(
		(orgId) => {
			setSelectedOrgIds((prevSelected) => {
				const newSelected = new Set(prevSelected);
				newSelected.has(orgId)
					? newSelected.delete(orgId)
					: newSelected.add(orgId);
				return newSelected;
			});
		},
		[setSelectedOrgIds]
	);

	// Lógica de Parseo de Contactos (Sin cambios)
	const getDisplayContacts = useCallback((org) => {
		let rawContacts = org.contactos || org.nombres_org;
		let contactsArray = [];

		if (rawContacts) {
			if (
				typeof rawContacts === "string" &&
				rawContacts.trim().startsWith("[")
			) {
				try {
					let clean = rawContacts.replace(/'/g, '"');
					contactsArray = JSON.parse(clean);
				} catch {
					contactsArray = [rawContacts];
				}
			} else if (typeof rawContacts === "string") {
				contactsArray = [rawContacts];
			} else if (Array.isArray(rawContacts)) {
				contactsArray = rawContacts;
			}
		}
		contactsArray = contactsArray.filter((c) => c && String(c).trim() !== "");
		if (contactsArray.length === 0)
			return { display: ["Sin contacto"], more: 0 };

		const limitedContacts = contactsArray.slice(0, 3);
		const remaining = contactsArray.length - limitedContacts.length;
		return { display: limitedContacts, more: remaining };
	}, []);

	// Retornamos el estado y los handlers
	return {
		paginatedOrgs,
		areAllOnPageSelected,
		handleSelectAll,
		handleSelectOrg,
		getDisplayContacts,
	};
};