import React from "react";

export function renderPressInlineTokens(text) {
    const parts = String(text || "").split(/(\[URL\]|\[IMAGEN\])/g);

    return parts.filter(Boolean).map((part, index) => {
        if (part === "[URL]" || part === "[IMAGEN]") {
            return null;
        }

        return <span key={`text-${index}`}>{part}</span>;
    });
}

export function normalizePressEmailBlocks(value) {
    if (!value) {
        return [];
    }

    const cleaned = sanitizePressEmailText(value);

    const normalized = insertPressStructuralBreaks(cleaned)
        .replace(/\*\*/g, "\n\n")
        .replace(/\s*\[URL\]\s*/g, " ")
        .replace(/\s*\[IMAGEN\]\s*/g, " ")
        .replace(/\s-\s(?=[A-ZÁÉÍÓÚÜÑ0-9])/g, "\n\n")
        .replace(/\n\s*[-•]\s+/g, "\n• ")
        .replace(/([.:!?])\s+(?=[A-ZÁÉÍÓÚÜÑ][a-záéíóúüñ]+:\s)/g, "$1\n\n")
        .replace(/(FICHA T[ÉE]CNICA|Para m[aá]s informaci[oó]n|Acceso al|Recordatorio a la Comisi[oó]n|Desastres mineros para no olvidar)\s*/gi, "\n\n$1\n\n")
        .replace(/\s+•\s+/g, "\n• ")
        .replace(/\s{2,}/g, " ")
        .replace(/(?:\r\n|\r|\n)/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

    const paragraphs = normalized
        .split(/\n\n+/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean);

    const expandedParagraphs = paragraphs.flatMap(expandLongPressParagraph);

    return expandedParagraphs.flatMap((paragraph, index) => {
        if (index === 0 && /visualiza este correo electr[óo]nico/i.test(paragraph)) {
            return [{ type: "callout", text: paragraph }];
        }

        if (looksLikeListBlock(paragraph)) {
            return [{ type: "list", items: splitListItems(paragraph) }];
        }

        if (looksLikeMetaBlock(paragraph)) {
            return [{ type: "meta", text: paragraph }];
        }

        if (looksLikeHeading(paragraph)) {
            return [{ type: "heading", text: paragraph }];
        }

        return [{ type: "paragraph", text: paragraph }];
    });
}

export function sanitizePressEmailText(value) {
    return String(value || "")
        .replace(/\[([^\]]+)\]\((mailto:[^)]+)\)/gi, "$1")
        .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/gi, "$1")
        .replace(/\((https?:\/\/[^)\s]+)(?:\s+imagen)?\)/gi, " ")
        .replace(/\bhttps?:\/\/[^\s)]+/gi, " ")
        .replace(/\bwww\.[^\s)]+/gi, " ")
        .replace(/\bmailto:[^\s)]+/gi, "")
        .replace(/\bIm[aá]gen\s*:\s*/gi, "")
        .replace(/\b(enlace|imagen)\b/gi, "")
        .replace(/\[\s*URL\s*\]/gi, "")
        .replace(/\[\s*IMAGEN\s*\]/gi, "")
        .replace(/\[\s*\]/g, "")
        .replace(/(^|\s)\*([^*\n]+)\*(?=\s|$)/g, "$1$2")
        .replace(/[“”]/g, '"')
        .replace(/[‘’]/g, "'")
        .replace(/[_`#]+/g, "")
        .replace(/[\u200B-\u200D\uFEFF]/g, "")
        .replace(/[ \t]+\n/g, "\n")
        .replace(/\n[ \t]+/g, "\n")
        .replace(/\s{2,}/g, " ")
        .trim();
}

export function insertPressStructuralBreaks(value) {
    return String(value || "")
        .replace(/\b(Además:)\b/gi, "\n\n$1")
        .replace(/\b(Ver en navegador)\b/gi, "\n\n$1")
        .replace(/\b(Noticias del d[ií]a[^|]*\|[^.]*\.)/gi, "\n\n$1")
        .replace(/\b(OPINI[ÓO]N|JUGAR)\b/g, "\n\n$1")
        .replace(/\b(¿Qu[eé] te parece el nuevo diseño de la newsletter\?|¿Necesitas ayuda\?|Apúntate a otras newsletters|Síguenos en:|Descarga nuestra app:|Estás recibiendo esta comunicación porque|Para más información:|FICHA T[ÉE]CNICA|Goles:|[ÁA]rbitro:|Estadio:)\b/g, "\n\n$1")
        .replace(/\b(Declaraciones entrenadores:)\b/g, "$1\n\n")
        .replace(/\b(Acceso al MANIFIESTO)\b/gi, "\n\n$1")
        .replace(/\b(Recordatorio a la Comisi[oó]n|Desastres mineros para no olvidar)\b/gi, "\n\n$1")
        .replace(/\s{2,}/g, " ");
}

export function expandLongPressParagraph(paragraph) {
    const text = String(paragraph || "").trim();
    if (!text) return [];

    if (text.length < 420) {
        return [text];
    }

    const sentences = text
        .split(/(?<=[.!?"'])\s+(?=[A-ZÁÉÍÓÚÜÑ¿])/)
        .map((sentence) => sentence.trim())
        .filter(Boolean);

    if (sentences.length < 3) {
        return [text];
    }

    const chunks = [];
    let currentChunk = [];

    sentences.forEach((sentence) => {
        const nextLength = [...currentChunk, sentence].join(" ").length;
        if (currentChunk.length >= 3 || nextLength > 420 || looksLikeHeading(sentence)) {
            if (currentChunk.length > 0) {
                chunks.push(currentChunk.join(" "));
                currentChunk = [];
            }
        }

        currentChunk.push(sentence);
    });

    if (currentChunk.length > 0) {
        chunks.push(currentChunk.join(" "));
    }

    return chunks;
}

export function looksLikeListBlock(text) {
    return splitListItems(text).length >= 2;
}

export function splitListItems(text) {
    const normalized = String(text || "").trim();
    if (!normalized) return [];

    const bulletItems = normalized
        .split(/\n•\s*/)
        .map((item) => item.replace(/^•\s*/, "").trim())
        .filter(Boolean);

    if (bulletItems.length >= 2) {
        return bulletItems;
    }

    if (/^(Priorizar|Incrementar|Dar tiempo|Garantizar)\b/i.test(normalized)) {
        return normalized
            .split(/;\s+/)
            .map((item) => item.trim())
            .filter(Boolean);
    }

    return [];
}

export function looksLikeMetaBlock(text) {
    return /^(Para m[aá]s informaci[oó]n|FICHA T[ÉE]CNICA|Goles:|[ÁA]rbitro:|Estadio:|Prensa |SEO\/BirdLife)/i.test(String(text || "").trim());
}

export function looksLikeHeading(text) {
    const normalized = String(text || "").trim();
    if (!normalized) return false;
    if (normalized.length > 120) return false;

    const alphaChars = normalized.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g, "");
    if (!alphaChars) return false;

    const upperChars = alphaChars.replace(/[^A-ZÁÉÍÓÚÜÑ]/g, "");
    return upperChars.length / alphaChars.length > 0.45;
}
