const API_BASE = '/api/fspzap';

const api = {
  async get(endpoint, params = {}) {
    const url = new URL(`${API_BASE}${endpoint}`, window.location.origin);
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.append(key, value);
    });

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Erro na API: ${response.statusText}`);
    }
    return response.json();
  },

  async post(endpoint, data) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro na API');
    }
    return response.json();
  },

  getKPIs(filters) {
    return this.get('/kpis', filters);
  },

  getPorAgente(filters) {
    return this.get('/por-agente', filters);
  },

  getPorDepartamento(filters) {
    return this.get('/por-departamento', filters);
  },

  getPorHora(filters) {
    return this.get('/por-hora', filters);
  },

  getSatisfacao(filters) {
    return this.get('/satisfacao', filters);
  },

  getRelatorio(filters, limit) {
    return this.get('/relatorio', { ...filters, limit });
  },

  getResumoImportacao() {
    return this.get('/resumo-importacao');
  },

  importFile(fileData, fileName, batchSize) {
    return this.post('/import', { fileData, fileName, batchSize });
  }
};
