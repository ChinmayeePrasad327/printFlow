import { api } from './api';

export const PrintersService = {
  async list() {
    const r = await api.get('/api/printers');
    return r.data;
  },
  async recommendations(params?: any) {
    const r = await api.get('/api/printers/recommendations', { params });
    return r.data;
  }
};
