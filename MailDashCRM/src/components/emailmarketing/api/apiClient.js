// Mock apiClient.js (EmailMarketing) para Portfolio
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const entesAPI = {
  getAll: async () => {
    await delay(300);
    return [{ id: 1, name: "Ente Mock 1" }];
  },
  getById: async (id) => {
    await delay(200);
    return { id, name: "Ente Mock 1" };
  },
  create: async (data) => {
    await delay(300);
    return { success: true };
  },
  update: async (id, data) => {
    await delay(300);
    return { success: true };
  },
  delete: async (id) => {
    await delay(300);
    return { success: true };
  },
};

export const patrociniosAPI = {
  getAll: async () => {
    await delay(300);
    return [{ licitacion_id: 1, name: "Patrocinio Mock 1" }];
  },
  create: async (data) => {
    await delay(300);
    return { success: true };
  },
  update: async (licitacionId, data) => {
    await delay(300);
    return { success: true };
  },
  delete: async (licitacionId) => {
    await delay(300);
    return { success: true };
  },
};

export const promptsAPI = {
  getAll: async () => {
    await delay(300);
    return [{ id: 1, name: "Prompt Mock 1", estado: true }];
  },
  getById: async (id) => {
    await delay(200);
    return { id, name: "Prompt Mock 1", estado: true };
  },
  create: async (data) => {
    await delay(300);
    return { success: true };
  },
  update: async (id, data) => {
    await delay(300);
    return { success: true };
  },
  delete: async (id) => {
    await delay(300);
    return { success: true };
  },
  toggleEstado: async (id, nuevoEstado) => {
    await delay(300);
    return { success: true };
  },
};

export const adjudicatariosAPI = {
  getAll: async () => {
    await delay(300);
    return [{ id: 1, name: "Adjudicatario Mock 1" }];
  },
  getById: async (id) => {
    await delay(200);
    return { id, name: "Adjudicatario Mock 1" };
  },
};

export const entesClient = {};
export const patrociniosClient = {};
export const promptsClient = {};
export const adjudicatariosClient = {};
