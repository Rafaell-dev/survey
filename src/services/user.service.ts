import { api } from './api';
import { UserDTO, UpdateAccessDTO, UpdateTypeDTO, UpdatePasswordDTO } from '../domain/user.types';

export const userService = {
  getUsers: async (): Promise<UserDTO[]> => {
    const response = await api.get('/users');
    return response.data;
  },

  updateAccessStatus: async (userId: string, data: UpdateAccessDTO): Promise<void> => {
    await api.patch(`/users/${userId}/access`, data);
  },

  updateUserType: async (userId: string, data: UpdateTypeDTO): Promise<void> => {
    await api.patch(`/users/${userId}/type`, data);
  },

  resetPassword: async (userId: string, data: UpdatePasswordDTO): Promise<void> => {
    await api.patch(`/users/${userId}/password`, data);
  }
};
