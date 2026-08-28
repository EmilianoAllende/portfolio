export const normalizeEmailPreview = (rawEmail) => {
    if (!rawEmail || typeof rawEmail !== "object") return null;

    const subject =
        rawEmail.subject ||
        rawEmail.asunto ||
        rawEmail.title ||
        "";

    const body =
        rawEmail.body ||
        rawEmail.cuerpo ||
        rawEmail.message ||
        rawEmail.content ||
        rawEmail.html ||
        rawEmail.text ||
        "";

    const button =
        rawEmail.button ||
        (rawEmail.buttonText && rawEmail.buttonUrl
            ? { text: rawEmail.buttonText, url: rawEmail.buttonUrl }
            : null);

    if (!subject && !body) return null;

    return {
        ...rawEmail,
        subject,
        body,
        ...(button ? { button } : {}),
    };
};
