// Simple localStorage-backed store for campaign templates
// Template shape:
// { id: string, title: string, description: string, mode: 'builder' | 'raw',
//   rawPrompt?: string,
//   builder?: { campaignType: string, instructions?: string, examplesGood?: string, examplesBad?: string, useMetadata?: boolean },
//   createdAt?: string, // ISO Date
//   updatedAt?: string  // ISO Date
// }

const STORAGE_KEY = 'campaign_templates_v1';

export function getTemplates() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr;
  } catch (e) {
    console.warn('campaignsStore: error parsing templates, resetting', e);
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

export function saveTemplates(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('campaignsStore: error saving templates', e);
  }
}

export function upsertTemplate(template) {
  const list = getTemplates();
  const idx = list.findIndex(t => t.id === template.id);
  
  // Obtenemos la fecha actual en formato ISO
  const now = new Date().toISOString();

  if (idx >= 0) {
    // Si existe, actualizamos. 
    // Mantenemos el createdAt original si existe, si no, usamos 'now' (para registros antiguos).
    // Actualizamos el updatedAt.
    list[idx] = { 
      ...template,
      createdAt: list[idx].createdAt || now,
      updatedAt: now
    };
  } else {
    // Si es nuevo, asignamos ambas fechas
    list.push({ 
      ...template,
      createdAt: now,
      updatedAt: now
    });
  }

  saveTemplates(list);
  
  // Retornamos el elemento actualizado o creado
  return idx >= 0 ? list[idx] : list[list.length - 1];
}

export function deleteTemplate(id) {
  const list = getTemplates().filter(t => t.id !== id);
  saveTemplates(list);
}

export function seedIfEmpty(defaults) {
  const current = getTemplates();
  if (current.length === 0 && defaults && defaults.length) {
    // Al sembrar datos por defecto, les asignamos fecha si no la tienen
    const now = new Date().toISOString();
    const defaultsWithDates = defaults.map(d => ({
        ...d,
        createdAt: d.createdAt || now,
        updatedAt: d.updatedAt || now
    }));
    
    saveTemplates(defaultsWithDates);
    return defaultsWithDates;
  }
  return current;
}
