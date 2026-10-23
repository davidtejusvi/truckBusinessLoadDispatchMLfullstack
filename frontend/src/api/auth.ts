import { apiClient } from './client';

interface LoginParams { email: string; password: string; }
interface RegisterParams { email: string; password: string; firstName: string; lastName: string; role: string; market: string; companyName: string; }
interface AuthResponse { token: string; user: { id: string; email: string; firstName: string; lastName: string; role: string; market: string; }; }

export const authApi = {
  login: async (params: LoginParams): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/login', params);
    return res.data;
  },
  register: async (params: RegisterParams): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/register', params);
    return res.data;
  },
};
