import { api } from './api';
import {
  LoginRequestDTO,
  LoginResponseDTO,
  RegisterRequestDTO,
  RegisterResponseDTO,
  User
} from '../domain/auth.types';

export const authService = {
  async register(data: RegisterRequestDTO): Promise<RegisterResponseDTO> {
    const response = await api.post<RegisterResponseDTO>('/auth/register', data);
    return response.data;
  },

  async login(data: LoginRequestDTO): Promise<LoginResponseDTO> {
    const response = await api.post<LoginResponseDTO>('/auth/login', data);
    return response.data;
  },

  async logout(refreshToken: string): Promise<void> {
    await api.post('/auth/logout', { refreshToken });
  },

  async me(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  }
};
