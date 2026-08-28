// Utilidades para el manejo de organizaciones, por una cuestión de modularización.

/**
 * Extrae el tipo de entidad del metadata de una organización
 * @param {Object} org - Objeto de organización
 * @returns {string} - Tipo de entidad o string vacío
 */
export const getEntityType = (org) => {
    // Priorizar el campo directo tipo_entidad si existe
    if (org.tipo_entidad) {
        return org.tipo_entidad;
    }

    // Fallback al metadata si no existe tipo_entidad
    try {
        if (typeof org.metadata === "string" && org.metadata !== "indefinido") {
            const parsedMeta = JSON.parse(org.metadata);
            return parsedMeta?.organizacion?.tipo || "";
        }
    } catch (e) {
        // Ignorar errores de parseo
    }
    return "";
};

/**
 * Devuelve la lista de islas, en mayúsculas solo si el subtipo es "contratacion_ayuntamientos"
 * @param {string} subtipo
 * @param {string[]} islasBD - Lista de islas desde la base de datos (opcional)
 * @returns {string[]}
 */
export const getIslasForSubtipo = (subtipo, islasBD) => {
    const islasCanarias = [
        "Gran Canaria",
        "Tenerife",
        "Lanzarote",
        "Fuerteventura",
        "La Palma",
        "La Gomera",
        "El Hierro",
        "Canarias",
    ];
    // Si recibes las islas desde la base de datos, filtra solo las que estén en la lista oficial (ignorando mayúsculas)
    if (Array.isArray(islasBD)) {
        return islasCanarias.filter(islaOficial =>
            islasBD.some(islaBD => normalizeString(islaOficial) === normalizeString(islaBD))
        );
    }
    return islasCanarias;
};

export const COMUNIDADES_AUTONOMAS_ESPANA = [
    "Andalucía",
    "Aragón",
    "Asturias",
    "Islas Baleares",
    "Canarias",
    "Cantabria",
    "Castilla y León",
    "Castilla-La Mancha",
    "Cataluña",
    "Comunidad Valenciana",
    "Extremadura",
    "Galicia",
    "Madrid",
    "Murcia",
    "Navarra",
    "País Vasco",
    "La Rioja",
    "Ceuta",
    "Melilla"
];

export const PROVINCIAS_POR_COMUNIDAD = {
    "Andalucía": ["Almería", "Cádiz", "Córdoba", "Granada", "Huelva", "Jaén", "Málaga", "Sevilla"],
    "Aragón": ["Huesca", "Teruel", "Zaragoza"],
    "Asturias": ["Asturias"],
    "Islas Baleares": ["Islas Baleares"],
    "Canarias": ["Las Palmas", "Santa Cruz de Tenerife"],
    "Cantabria": ["Cantabria"],
    "Castilla y León": ["Ávila", "Burgos", "León", "Palencia", "Salamanca", "Segovia", "Soria", "Valladolid", "Zamora"],
    "Castilla-La Mancha": ["Albacete", "Ciudad Real", "Cuenca", "Guadalajara", "Toledo"],
    "Cataluña": ["Barcelona", "Girona", "Lleida", "Tarragona"],
    "Comunidad Valenciana": ["Alicante", "Castellón", "Valencia"],
    "Extremadura": ["Badajoz", "Cáceres"],
    "Galicia": ["A Coruña", "Lugo", "Ourense", "Pontevedra"],
    "Madrid": ["Madrid"],
    "Murcia": ["Murcia"],
    "Navarra": ["Navarra"],
    "País Vasco": ["Álava", "Bizkaia", "Gipuzkoa"],
    "La Rioja": ["La Rioja"],
    "Ceuta": ["Ceuta"],
    "Melilla": ["Melilla"]
};

export const PROVINCIAS_ESPANA = [
    "A Coruña",
    "Álava",
    "Albacete",
    "Alicante",
    "Almería",
    "Asturias",
    "Ávila",
    "Badajoz",
    "Barcelona",
    "Burgos",
    "Cáceres",
    "Cádiz",
    "Cantabria",
    "Castellón",
    "Ceuta",
    "Ciudad Real",
    "Córdoba",
    "Cuenca",
    "Girona",
    "Granada",
    "Guadalajara",
    "Gipuzkoa",
    "Huelva",
    "Huesca",
    "Islas Baleares",
    "Jaén",
    "La Rioja",
    "Las Palmas",
    "León",
    "Lleida",
    "Lugo",
    "Madrid",
    "Málaga",
    "Melilla",
    "Murcia",
    "Navarra",
    "Ourense",
    "Palencia",
    "Pontevedra",
    "Salamanca",
    "Santa Cruz de Tenerife",
    "Segovia",
    "Sevilla",
    "Soria",
    "Tarragona",
    "Teruel",
    "Toledo",
    "Valencia",
    "Valladolid",
    "Bizkaia",
    "Zamora",
    "Zaragoza",
];

export const normalizeLocationValue = (value) =>
    String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toUpperCase();

/**
 * Normaliza un texto removiendo acentos/tildes y convirtiendo a minúsculas.
 * Útil para búsquedas o comparaciones insensibles a mayúsculas y acentos.
 * @param {string} value 
 * @returns {string}
 */
export const normalizeString = (value) =>
    String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/_/g, " ")
        .trim()
        .toLowerCase();

export const getOrganizationMunicipio = (org) => {
    if (!org) return "";

    if (org.municipio && String(org.municipio).trim().toLowerCase() !== "indefinido") {
        return String(org.municipio).trim();
    }

    try {
        const metadata = typeof org.metadata === "string" ? JSON.parse(org.metadata) : org.metadata;
        const municipio = metadata?.ubicacion?.municipio || metadata?.organizacion?.municipio || "";
        return String(municipio || "").trim();
    } catch {
        return "";
    }
};

export const TIPOS_ENTIDAD = {
    SECTOR_PUBLICO_CANARIO: "sector_publico_canario",
    EMPRESAS: "empresas",
    ASOCIACIONES: "asociaciones",
    MEDIOS: "medios",
    AGENCIAS: "agencias",
    CON_COMPETIDORES: "competidores",
    OTROS: "otros",
};

export const LISTA_BLANCA_HIERARCHY = {
    "gobierno": {
        "consejerias": ["direcciones generales"]
    },
    "entes_publicos_de_gobierno": {
        "empresas": ["gerentes"],
        "entes": ["gerentes"]
    },
    "cabildos": {
    },
    "ayuntamientos": {
        "todos_los_ayuntamientos_(sin_mancomunidades)": ["alcaldias", "concejalias", "contratacion"],
        "mancomunidades": []
    },
    "otro_sector_publico": {
        "administracion central": [],
        "organismos_autonomos": [],
        "empresas_publicas": [],
        "consorcios_publicos_canarios": [],
        "fuerzas_y_cuerpos_de_seguridad_en_canarias": [],
        "otros": []
    },
    "empresas": {
        "hosteleria_y_turismo": [],
        "transporte_y_logistica": [],
        "energia_y_utilities": [],
        "construccion_e_inmobiliario": [],
        "comercio_y_distribucion": [],
        "alimentacion_y_bebidas": [],
        "servicios_profesionales": [],
        "tecnologia_y_comunicaciones": [],
        "industria_y_manufactura": [],
        "banca_y_seguros": [],
        "ocio_y_entretenimiento": [],
        "educacion_privada": [],
        "sanidad_privada": [],
        "deporte_profesional": [],
        "otros": []
    },
    "asociaciones": {
        "organizaciones_empresariales": [],
        "sindicatos": [],
        "partidos_politicos": [],
        "colegios_profesionales": [],
        "federaciones_deportivas": [],
        "asociaciones_culturales": [],
        "entidades_medioambientales": [],
        "organizaciones_sociales": [],
        "fundaciones": [],
        "cofradias_y_hermandades": [],
        "asociaciones_vecinales": [],
        "ongs_y_cooperacion": [],
        "plataformas_ciudadanas": [],
        "asociaciones_profesionales": [],
        "entidades_religiosas": [],
        "otros": []
    },
    "medios": {
        "prensa": [],
        "radio": [],
        "tv": [],
        "digitales": []
    },
    "agencias": {
        "comunicacion": [],
        "eventos_y_productoras": []
    },
    "con_competidores": {},
    "otros": {}
};

const ISLAS_CANARIAS_HIERARCHY = [
    "Gran Canaria", "Tenerife", "Lanzarote", "Fuerteventura", "La Palma", "La Gomera", "El Hierro"
];

ISLAS_CANARIAS_HIERARCHY.forEach(isla => {
    LISTA_BLANCA_HIERARCHY["cabildos"][`cabildo ${isla.toLowerCase()}`] = ["presidentes", "consejeria"];
    LISTA_BLANCA_HIERARCHY["ayuntamientos"][`ayuntamientos ${isla.toLowerCase()}`] = ["alcaldias", "concejalias", "contratacion"];
});

export const SUBTIPOS_POR_ENTIDAD = {
    [TIPOS_ENTIDAD.SECTOR_PUBLICO_CANARIO]: [
        "delegacion_en_canarias_de_administracion_central",
        "administracion_autonomica_canaria",
        "cabildos_insulares",
        "ayuntamientos",
        "Contratación Ayuntamientos", // corregido a snake_case y minúsculas
        "alcaldia",
        "mancomunidades",
        "organismos_autonomos",
        "empresas_publicas_canarias",
        "consorcios_publicos_canarios",
        "fuerzas_y_cuerpos_de_seguridad_en_canarias",
        "otros",
    ],
    [TIPOS_ENTIDAD.EMPRESAS]: [
        "hosteleria_y_turismo",
        "transporte_y_logistica",
        "energia_y_utilities",
        "construccion_e_inmobiliario",
        "comercio_y_distribucion",
        "alimentacion_y_bebidas",
        "servicios_profesionales",
        "tecnologia_y_comunicaciones",
        "industria_y_manufactura",
        "banca_y_seguros",
        "ocio_y_entretenimiento",
        "educacion_privada",
        "sanidad_privada",
        "deporte_profesional",
        "otros",
    ],
    [TIPOS_ENTIDAD.ASOCIACIONES]: [
        "organizaciones_empresariales",
        "sindicatos",
        "partidos_politicos",
        "colegios_profesionales",
        "federaciones_deportivas",
        "asociaciones_culturales",
        "entidades_medioambientales",
        "organizaciones_sociales",
        "fundaciones",
        "cofradias_y_hermandades",
        "asociaciones_vecinales",
        "ongs_y_cooperacion",
        "plataformas_ciudadanas",
        "asociaciones_profesionales",
        "entidades_religiosas",
        "otros",
    ],
    [TIPOS_ENTIDAD.MEDIOS]: [
        "prensa",
        "radio",
        "tv",
        "digitales",
    ],
    [TIPOS_ENTIDAD.AGENCIAS]: [
        "comunicacion",
        "eventos_y_productoras",
    ],
    [TIPOS_ENTIDAD.CON_COMPETIDORES]: [
        "licitacion_publica",
        "sin_licitacion",
    ],
};
/* Constantes para estados de cliente */
export const ESTADOS_CLIENTE = {
    PENDIENTE: undefined || null || 0, // "sin clasificar"
    LISTA_BLANCA: 1, // "blanca canarias"
    LISTA_NEGRA: 2, // "negra"
    LISTA_BLANCA_NACIONAL: 3, // "Nacional"
    OTRO_TIPO: 4, // "otro tipo"
    COMPETENCIA: 5, // "competencia"
    REVISION: 6, // "revision"
    CONTACTOS_BODY: 7, // "contactos_body"
    PRUEBAS_INTERNAS: 8, // "pruebas internas"
};
/**
 * Obtiene el label del estado
 * @param {number} estado - Estado numérico
 * @returns {string} - Label del estado
 */
export const getEstadoLabel = (estado) => {
    switch (estado) {
        case ESTADOS_CLIENTE.LISTA_BLANCA:
            return "Lista Blanca";
        case ESTADOS_CLIENTE.LISTA_NEGRA:
            return "Lista Negra";
        case ESTADOS_CLIENTE.LISTA_BLANCA_NACIONAL:
            return "Lista Blanca Nacional";
        case ESTADOS_CLIENTE.OTRO_TIPO:
            return "Otro Tipo";
        case ESTADOS_CLIENTE.COMPETENCIA:
            return "Con Competencia";
        case ESTADOS_CLIENTE.REVISION:
            return "Revision";
        case ESTADOS_CLIENTE.CONTACTOS_BODY:
            return "Contactos del body";
        case ESTADOS_CLIENTE.PENDIENTE:
            return "Pendiente";
        case ESTADOS_CLIENTE.PRUEBAS_INTERNAS:
            return "Pruebas Internas";
        default:
            return "No definidos";
    }
};

/**
 * Parsea una fecha en string a formato ISO o mantiene el original si ya lo es.
 * Soporta formato dd/MM/yyyy HH:mm
 * @param {string} str - Fecha en string
 * @returns {string} - Fecha en formato ISO o string original
 */
export const parseDate = (str) => {
    if (!str) return str;
    if (/\d{4}-\d{2}-\d{2}T/.test(str)) return str;
    const m = str.match(/(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})/);
    if (m) {
        return `${m[3]}-${m[2]}-${m[1]}T${m[4]}:${m[5]}:00Z`;
    }
    return str;
};

/**
 * Helper to normalize a sender identifier (name, legacy id, or UUID) into a standard UUID 
 * based on the database 'senders' table rows.
 * @param {string} val - Unnormalized sender identifer
 * @returns {string} - UUID or lowered string fallback
 */
export const getSenderUUID = (val) => {
    if (!val) return null;
    const str = val.toString().trim();
    // Is it already a UUID?
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)) {
        return str.toLowerCase();
    }
    
    // Reverse lookup map (display_name, label, or old legacy ID -> UUID)
    const map = {
        "enrique de fundación emprende": "07017dcc-80de-4681-91ed-67f17aa9ba99",
        "fundación emprende": "07017dcc-80de-4681-91ed-67f17aa9ba99",
        "fundacion": "07017dcc-80de-4681-91ed-67f17aa9ba99", // legacy
        
        "canaria": "2dad8612-34a5-493d-9ccd-fccd2a0aba05",
        
        "goblab gran canaria": "36589592-98ba-4523-b4f0-89a6cada37bd",
        "goblab": "36589592-98ba-4523-b4f0-89a6cada37bd", // legacy
        
        "este es el display namefgfgh": "5adbe1d4-1551-4740-96e7-e3c7cea7dcde",
        "prueba piña fgfghdfghdfgh": "5adbe1d4-1551-4740-96e7-e3c7cea7dcde",
        
        "andrea de mmi analytics": "8a2f28d5-1010-48fd-b5df-fbb6d86a0bea",
        "mmi analytics": "8a2f28d5-1010-48fd-b5df-fbb6d86a0bea",
        "mmi": "8a2f28d5-1010-48fd-b5df-fbb6d86a0bea", // legacy
        
        "123 display": "a128c045-80a0-4bd7-a4cf-a1bc2dd22acc",
        "123 etiqueta": "a128c045-80a0-4bd7-a4cf-a1bc2dd22acc"
    };
    
    return map[str.toLowerCase()] || str.toLowerCase();
};

/**
 * Obtiene la fecha del último contacto por email desde el log de campañas.
 * Opcionalmente filtra para considerar solo los envíos realizados con un remitente específico.
 * @param {Object} org - Objeto de organización
 * @param {string|Object} [sender] - ID del remitente (string) o un Objeto Sender completo para macheo más robusto
 * @returns {{date: string|null, campaignTitle: string|null}} - Detalles del último contacto
 */
export const getLastMailContactDetails = (org, sender) => {
    if (!org || !org.campaigns_log) return { date: null, campaignTitle: null };
    let log = org.campaigns_log;
    if (typeof log === 'string') {
        try { log = JSON.parse(log); } catch { return { date: null, campaignTitle: null }; }
    }

    let lastDate = null;
    let lastCampaignTitle = null;

    Object.entries(log).forEach(([campaignKey, entry]) => {
        if (entry && entry.last_sent) {
            let matchesSender = true;
            if (sender) {
                const logSenderRaw = entry.sender_id || entry.senderName || entry.sender_name || entry.senderEmail || entry.sender_email || entry.sender || entry.fromName || entry.fromEmail;
                
                if (logSenderRaw) {
                    const lsUuid = getSenderUUID(logSenderRaw) || String(logSenderRaw).toLowerCase();
                    const rawStr = String(logSenderRaw).toLowerCase();

                    // Check if lsUuid is an actual UUID format
                    const isLsValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(lsUuid);

                    if (typeof sender === 'object') {
                        const sIdUuid = getSenderUUID(sender.id);
                        const isSIdValidUUID = sIdUuid && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sIdUuid);

                        const sEmail = sender.email ? sender.email.toLowerCase() : null;
                        const sName = sender.displayName ? sender.displayName.toLowerCase() : null;
                        const sLabel = sender.label ? sender.label.toLowerCase() : null;

                        matchesSender = 
                            (sIdUuid && (lsUuid === sIdUuid || lsUuid.includes(sIdUuid) || sIdUuid.includes(lsUuid))) ||
                            (sEmail && (rawStr.includes(sEmail) || sEmail.includes(rawStr))) ||
                            (sName && (rawStr.includes(sName) || sName.includes(rawStr))) ||
                            (sLabel && (rawStr.includes(sLabel) || sLabel.includes(rawStr)));

                        // Si no hizo match, pero ALGÚN ID (el del log o el de la campaña) NO es un UUID válido (ej: legacy string viejo irreconocible),
                        // bloquemos por precaución porque no podemos garantizar que no sean el mismo.
                        if (!matchesSender && (!isLsValidUUID || !isSIdValidUUID)) {
                            matchesSender = true;
                        }
                    } else {
                        const sIdUuid = getSenderUUID(sender);
                        const isSIdValidUUID = sIdUuid && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sIdUuid);
                        
                        matchesSender = lsUuid === sIdUuid || lsUuid.includes(sIdUuid) || sIdUuid.includes(lsUuid);
                        
                        if (!matchesSender && (!isLsValidUUID || !isSIdValidUUID)) {
                            matchesSender = true;
                        }
                    }
                } else {
                    // Si el log no tiene ninguna información de remitente conservamos el bloqueo por precaución
                    matchesSender = true;
                }
            }

            if (matchesSender) {
                if (!lastDate || new Date(parseDate(entry.last_sent)) > new Date(parseDate(lastDate))) {
                    lastDate = entry.last_sent;
                    lastCampaignTitle =
                        entry.template_title ||
                        entry.campaign_title ||
                        entry.title ||
                        campaignKey ||
                        null;
                }
            }
        }
    });

    return {
        date: lastDate,
        campaignTitle: lastCampaignTitle,
    };
};

/**
 * Obtiene la fecha del último contacto por email desde el log de campañas.
 * Opcionalmente filtra para considerar solo los envíos realizados con un remitente específico.
 * @param {Object} org - Objeto de organización
 * @param {string} [senderId] - ID del remitente a evaluar
 * @returns {string|null} - Fecha del último contacto o null
 */
export const getLastMailContact = (org, senderId) => {
    return getLastMailContactDetails(org, senderId).date;
};

/**
 * Verifica si una organización ha sido contactada en los últimos 7 días.
 * BYPASS: Si el estado es PRUEBAS_INTERNAS (8), devuelve false (no bloqueado).
 * Opcionalmente evalúa la restricción basándose en un remitente específico.
 * @param {Object} org - Objeto de organización
 * @param {string} [senderId] - ID del remitente actual para la campaña seleccionada
 * @returns {boolean} - True si fue contactada recientemente (bloqueada)
 */
export const isRecentlyContacted = (org, senderId) => {
    // Si es Pruebas Internas, NUNCA bloquear por frecuencia
    if (org.estado_cliente === ESTADOS_CLIENTE.PRUEBAS_INTERNAS) return false;

    const lastContact = getLastMailContact(org, senderId);
    if (!lastContact || lastContact === "indefinido") return false;
    const lastDate = new Date(parseDate(lastContact));
    const now = new Date();
    const diffTime = now - lastDate;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays < 7;
};

/**
 * Formatea una fecha para mostrarla en la UI.
 * @param {string} dateString 
 * @returns {string|null}
 */
export const formatDate = (dateString) => {
	if (!dateString || dateString === "indefinido") return null;
	// Si es ISO
	let date = null;
	if (/\d{4}-\d{2}-\d{2}T/.test(dateString)) {
		date = new Date(dateString);
	} else {
		// Si es dd/MM/yyyy HH:mm (UTC-0)
		const m = dateString.match(/(\d{2})\/(\d{2})\/(\d{4})/);
		if (m) {
			// Solo fecha
			return `${m[1]}/${m[2]}/${m[3]}`;
		}
		// Fallback: intentar parsear
		date = new Date(dateString);
	}
	if (!date || isNaN(date.getTime())) return null;
	return new Intl.DateTimeFormat('es-ES', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric'
	}).format(date);
};

/**
 * Formatea la razón de baja para mostrarla en la UI.
 * @param {string|Array} reason 
 * @returns {string|null}
 */
export const formatBajaReason = (reason) => {
	if (!reason || reason === "indefinido") return null;
	
	// Si es string que parece un array JSON, convertir a array
	let parsedReason = reason;
	if (typeof reason === "string" && reason.startsWith("[")) {
		try {
			parsedReason = JSON.parse(reason);
		} catch (e) {
			// Si no puede parsear, dejar como está
		}
	}
	
	if (Array.isArray(parsedReason)) {
		if (parsedReason.length === 1 && parsedReason[0] === "MMI Analytics") {
			return "BAJA MANUAL";
		}
		return parsedReason.join(", ");
	}
	
	// Si es string directo
	if (typeof parsedReason === "string") {
		if (parsedReason === "MMI Analytics") {
			return "BAJA MANUAL";
		}
		return parsedReason.replace(/_/g, ' ').toUpperCase();
	}
	
	return null;
};
