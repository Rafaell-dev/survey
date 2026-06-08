export interface User {
  id: string;
  name: string;
  email: string;
}

export interface RegisterRequestDTO {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponseDTO {
  id: string;
  name: string;
  email: string;
}

export interface LoginRequestDTO {
  email: string;
  password: string;
}

export interface LoginResponseDTO {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshResponseDTO {
  accessToken: string;
  refreshToken: string;
}
