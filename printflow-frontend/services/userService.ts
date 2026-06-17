import { api } from "./api";

export interface SyncUserData {
  clerkId: string;
  email: string;
  name: string;
  rollNo?: string;
  department?: string;
}

export const syncUser = async (data: SyncUserData, token?: string | null) => {
  const response = await api.post("/users/sync", data, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return response.data;
};