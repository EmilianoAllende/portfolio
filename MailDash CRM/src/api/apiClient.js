// Mock apiClient.js para Portfolio
import axios from "axios";

const apiClient = axios.create();

// Simular delay de red
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

apiClient.getNotasClasificacion = async () => {
    await delay(500);
    return { data: [{ id: 1, title: 'Nota Mock 1', status: 'pending' }] };
};

apiClient.updateNotaStatus = async (id, status) => {
    await delay(300);
    return { data: { success: true } };
};

apiClient.getTemplates = async () => {
    await delay(500);
    return { data: [{ id: 1, name: 'Template Demo', content: 'Contenido mock' }] };
};

apiClient.saveTemplate = async () => {
    await delay(300);
    return { data: { success: true } };
};

apiClient.deleteTemplate = async () => {
    await delay(300);
    return { data: { success: true } };
};

apiClient.getOrganizaciones = async () => {
    await delay(500);
    return { data: [
        { id: 1, nombre: 'Empresa Demo A', industria: 'Tecnología' },
        { id: 2, nombre: 'Empresa Demo B', industria: 'Salud' }
    ]};
};

apiClient.getMenciones = async () => {
    await delay(500);
    return { data: [{ id: 1, texto: 'Mención de prueba en medios' }] };
};

apiClient.getMatching = async () => {
    await delay(500);
    return { data: [] };
};

apiClient.updateOrganization = async () => {
    await delay(300);
    return { data: { success: true } };
};

apiClient.createOrganizationFromAdmin = async () => {
    await delay(300);
    return { data: { success: true } };
};

apiClient.generatePreview = async () => {
    await delay(800);
    return { data: { previewUrl: 'https://via.placeholder.com/600x400' } };
};

apiClient.confirmAndSend = async () => {
    await delay(1000);
    return { data: { success: true } };
};

apiClient.getCampaignsHistory = async () => {
    await delay(500);
    return { data: [{ id: 1, name: 'Campaña Q1', status: 'sent', sentAt: '2026-01-10' }] };
};

apiClient.getEmailContent = async () => {
    await delay(300);
    return { data: { content: '<p>Email de prueba mockeado.</p>' } };
};

apiClient.createDynamicQueue = async () => {
    await delay(300);
    return { data: { success: true } };
};

apiClient.getNextInQueue = async () => {
    await delay(300);
    return { data: { id: 1, email: 'demo@example.com' } };
};

apiClient.skipTask = async () => {
    await delay(300);
    return { data: { success: true } };
};

apiClient.login = async (usuario, password) => {
    await delay(500);
    if (usuario === 'admin' && password === 'admin') {
        return { data: { token: 'mock-token-123', rol: 'admin' } };
    }
    throw new Error('Credenciales inválidas (usa admin/admin)');
};

apiClient.createUser = async () => {
    await delay(300);
    return { data: { success: true } };
};

apiClient.getUsers = async () => {
    await delay(500);
    return { data: [{ id: 1, usuario: 'admin', rol: 'admin' }] };
};

apiClient.resetUserPassword = async () => {
    await delay(300);
    return { data: { success: true } };
};

apiClient.deleteUser = async () => {
    await delay(300);
    return { data: { success: true } };
};

apiClient.addManualLog = async () => {
    await delay(300);
    return { data: { success: true } };
};

apiClient.getSenders = async () => {
    await delay(500);
    return [
        { id: 1, name: 'Sender Demo 1', email: 'sender1@demo.com' },
        { id: 2, name: 'Sender Demo 2', email: 'sender2@demo.com' }
    ];
};

apiClient.saveSender = async () => {
    await delay(300);
    return { success: true };
};

apiClient.deleteSender = async () => {
    await delay(300);
    return { success: true };
};

apiClient.getCtas = async () => {
    await delay(500);
    return [
        { id: 1, label: 'CTA Demo', category: 'General', buttonText: 'Click Aquí', buttonUrl: '#' }
    ];
};

apiClient.saveCta = async () => {
    await delay(300);
    return { data: { success: true } };
};

apiClient.deleteCta = async () => {
    await delay(300);
    return { data: { success: true } };
};

export const promptsAPI = {
    getAll: async () => {
        await delay(500);
        return [{ id: 1, title: 'Prompt Demo', content: 'Contenido del prompt mock.' }];
    },
    create: async () => {
        await delay(300);
        return { success: true };
    },
    update: async () => {
        await delay(300);
        return { success: true };
    },
    delete: async () => {
        await delay(300);
        return { success: true };
    },
    toggleEstado: async () => {
        await delay(300);
        return { success: true };
    }
};

apiClient.getGlobalEmailHistory = async () => {
    await delay(500);
    return { data: [] };
};

apiClient.getMediaFollowupEmails = async () => {
    await delay(500);
    return { data: [] };
};

apiClient.updateMediaFollowupEmail = async () => {
    await delay(300);
    return { data: { success: true } };
};

export default apiClient;