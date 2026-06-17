import { api } from './api';

export const UploadService = {
  async uploadFile(formData: FormData, onUploadProgress?: (progressEvent:any)=>void) {
    const r = await api.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress
    });
    return r.data;
  }
};
