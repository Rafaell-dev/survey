import { User } from './auth.types';

export type UserDTO = User & { createdAt: string };

export interface UpdateAccessDTO {
  status: 'ACTIVE' | 'BLOCKED';
}

export interface UpdateTypeDTO {
  role: 'ADMIN' | 'USER';
}

export interface UpdatePasswordDTO {
  password: string;
}
