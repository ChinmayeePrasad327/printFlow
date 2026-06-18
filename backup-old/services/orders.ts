import { api } from './api';

export const OrdersService = {
  async list() {
    const r = await api.get('/api/orders');
    return r.data;
  },
  async get(id: string) {
    const r = await api.get(`/api/orders/${id}`);
    return r.data;
  },
  async create(payload: any) {
    const r = await api.post('/api/orders', payload);
    return r.data;
  },
  async cancel(id: string) {
    const r = await api.patch(`/api/orders/${id}/cancel`);
    return r.data;
  },
  async requestPriority(id: string) {
    const r = await api.patch(`/api/orders/${id}/request-priority`);
    return r.data;
  }
};
