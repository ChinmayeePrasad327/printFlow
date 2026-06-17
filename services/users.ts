import { api } from './api';

export const UsersService = {
  async sync(payload: any) {
    const r = await api.post('/api/users/sync', payload);
    return r.data;
  }
};
