import { api } from './api';

export const NotificationsService = {
  async list() {
    const r = await api.get('/api/notifications');
    return r.data;
  }
};
