// Mock adjudicatariosClient.js para Portfolio
import axios from "axios";

const adjudicatariosClient = axios.create();

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const adjudicatariosAPI = {
  getRecent: async (params = {}, useTest = false) => {
    await delay(500);
    return { data: [
        { id: 1, title: 'Adjudicación Mock 1', amount: 50000, date: '2026-01-01', contact_email: 'test1@example.com' },
        { id: 2, title: 'Adjudicación Mock 2', amount: 150000, date: '2026-02-15', contact_email: 'test2@example.com' }
    ]};
  },

  triggerExtraction: async (adjudicationId) => {
    await delay(800);
    return { data: { success: true, message: 'Extracción iniciada (Mock)' } };
  },

  updateContact: async (id, email) => {
    await delay(300);
    return { data: { success: true } };
  },

  reprocessManual: async () => {
    await delay(500);
    return { data: { success: true } };
  },

  getPrompt: async () => {
    await delay(300);
    return { id: 1, system_prompt: 'Sistema mock', user_prompt: 'Usuario mock', tipo: 'adjudicatarios' };
  },

  updatePrompt: async (id, systemPrompt, userPrompt) => {
    await delay(300);
    return { data: { success: true } };
  },

  triggerCampaign: async (tenderIds, senderId) => {
    await delay(1000);
    return { data: { success: true } };
  },
};

export default adjudicatariosClient;
