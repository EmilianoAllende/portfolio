import { ESTADOS_CLIENTE } from "../../utils/organizationUtils";
import apiClient from "../../api/apiClient";

// org.id es el email del contacto cuando contiene "@"
export function getOrgEmail(org) {
    const id = org?.id;
    return typeof id === "string" && id.includes("@") ? id : null;
}

// Cruza el fromEmail de un correo Zimbra contra el listado de organizaciones.
export function matchEmailToOrg(fromEmail, organizaciones) {
    if (!fromEmail || !Array.isArray(organizaciones)) return null;
    const needle = fromEmail.toLowerCase().trim();
    return (
        organizaciones.find((org) => {
            const e = getOrgEmail(org);
            return e && e.toLowerCase().trim() === needle;
        }) ?? null
    );
}

// Normaliza el valor de licita_medios al mismo formato que useOrganizationList.
export function normalizeLicitaValue(rawValue) {
    if (rawValue === 1 || rawValue === "1" || rawValue === true || rawValue === "true") return "1";
    if (rawValue === 0 || rawValue === "0" || rawValue === false || rawValue === "false") return "0";
    return "sin_datos";
}

// Normaliza el valor de es_usuario_mmi al mismo formato que useOrganizationList.
export function normalizeMMIUserValue(rawValue) {
    if (rawValue === true || rawValue === "true" || rawValue === 1 || rawValue === "1") return "true";
    if (rawValue === false || rawValue === "false" || rawValue === 0 || rawValue === "0") return "false";
    return "sin_datos";
}

// Configuración de badge por estado_cliente (keyed por valor numérico de ESTADOS_CLIENTE).
export const ESTADO_BADGE_DISPLAY = {
    [ESTADOS_CLIENTE.LISTA_BLANCA]: {
        label: "Lista Blanca",
        style: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    },
    [ESTADOS_CLIENTE.LISTA_NEGRA]: {
        label: "Lista Negra",
        style: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    },
    [ESTADOS_CLIENTE.LISTA_BLANCA_NACIONAL]: {
        label: "Blanca Nacional",
        style: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
    },
    [ESTADOS_CLIENTE.OTRO_TIPO]: {
        label: "Otro Tipo",
        style: "bg-gray-100 text-gray-600 dark:bg-gray-700/60 dark:text-gray-400",
    },
    [ESTADOS_CLIENTE.COMPETENCIA]: {
        label: "Competencia",
        style: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
    },
    [ESTADOS_CLIENTE.REVISION]: {
        label: "Revisión",
        style: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
    },
    [ESTADOS_CLIENTE.CONTACTOS_BODY]: {
        label: "Body Only",
        style: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    },
    [ESTADOS_CLIENTE.PRUEBAS_INTERNAS]: {
        label: "Pruebas",
        style: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
    },
    [ESTADOS_CLIENTE.PENDIENTE]: {
        label: "Sin Clasificar",
        style: "bg-gray-100 text-gray-500 dark:bg-gray-700/40 dark:text-gray-500",
    },
};

// Obtiene las notas de clasificación desde la API de n8n
// La API devuelve notas de prensa con su clasificación (org, estado_cliente, etc.)
export async function fetchZimbraEmails() {
    try {
        const response = await apiClient.getNotasClasificacion();
        const data = Array.isArray(response?.data) ? response.data : [];
        
        console.log("✅ [Notas Clasificación] Obtenidas desde API:", data.length, "notas");
        console.log("📦 [Notas Clasificación] Primeras 3 notas:", data.slice(0, 3));
        
        // Mapear la estructura de la API a la esperada por el componente
        return data.map((nota) => {
            // Parsear nota_prensa si viene como JSON stringificado
            let notaPrensaParsed = {};
            try {
                notaPrensaParsed = typeof nota.nota_prensa === 'string' 
                    ? JSON.parse(nota.nota_prensa) 
                    : nota.nota_prensa || {};
            } catch (e) {
                console.warn("[Notas] Error parseando nota_prensa:", e);
            }
            
            // Parsear clasificacion_completa si viene como JSON stringificado
            let clasificacionParsed = {};
            try {
                clasificacionParsed = typeof nota.clasificacion_completa === 'string' 
                    ? JSON.parse(nota.clasificacion_completa) 
                    : nota.clasificacion_completa || {};
            } catch (e) {
                console.warn("[Notas] Error parseando clasificacion_completa:", e);
            }
            
            // Extraer datos de los JSON parseados
            const subject = notaPrensaParsed.subject || "";
            const body = notaPrensaParsed.body_short || "";
            const organizacion = clasificacionParsed.organizacion || notaPrensaParsed.sender || nota.email_id;
            
            // Parsear timestamp
            const fechaObj = new Date(nota.fecha_clasificacion);
            const time = fechaObj.toLocaleTimeString("es-ES", { 
                hour: "2-digit", 
                minute: "2-digit" 
            });
            const date = nota.fecha_clasificacion.split(" ")[0]; // "2026-05-12" de "2026-05-12 13:03:09..."
            
            return {
                id: nota.id || nota.nota_id,
                from: organizacion,
                fromEmail: nota.email_id,
                subject: subject,
                body: body,
                time: time,
                date: date,
                isRead: nota.status === true,
                // Datos de clasificación
                estado_cliente: nota.estado_cliente,
                tipo_entidad: nota.tipo_entidad,
                sub_tipo_entidad: nota.sub_tipo_entidad,
                isla: nota.isla,
                clase_entidad: nota.clase_entidad,
                motivo: nota.motivo,
                clasificacion_completa: clasificacionParsed,
                nota_prensa: notaPrensaParsed,
            };
        });
    } catch (error) {
        console.error("❌ [Notas Clasificación] Error al obtener notas:", error.message);
        console.warn("[Notas Clasificación] Usando datos de ejemplo (mock)");
        return MOCK_EMAILS;
    }
}
// FALLBACK: Array vacío si la API falla
// En desarrollo, comentar esta línea y usar MOCK_EMAILS para pruebas
export const MOCK_EMAILS = [];

// Formatea texto plano de email para mejor legibilidad
export function formatPlainTextEmail(text) {
    if (!text) return text;
    
    return text
        // Reemplazar caracteres especiales de separación
        .replace(/＆/g, "\n\n• ")
        // Separar números seguidos de punto (1. 2. 3.) con saltos de línea
        .replace(/(\d+\.\s+)/g, "\n\n$1")
        // Separar palabras clave de secciones con saltos de línea
        .replace(/\b(Model|Specifications|Operating|Environment|Contact|FOLLOW|Questions|References|Manage|This message|Appearance|Mainboard|Interface|Display|Panel|Brightness|Backlight|Package|Mounting|Power|Color|Bezel|Outline|Dimension|N\.W\.|G\.W\.|Contact us|Email|Skype|wechat|what's|app|Lily|www|The 3rd)\b/gi, "\n\n$1")
        // Limpiar URLs de correo comunes
        .replace(/\[\s*URL\s*\]/g, "[URL]")
        // Agregar saltos después de dos guiones consecutivos
        .replace(/([-]{3,})/g, "\n$1\n")
        // Limpiar espacios múltiples
        .replace(/\s{2,}/g, " ")
        // Normalizar saltos de línea
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}


