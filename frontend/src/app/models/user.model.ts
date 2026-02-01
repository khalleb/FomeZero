export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  name: string;
  email: string;
}

export interface User {
  id?: string;
  name: string;
  email: string;
  active: boolean;
  createdAt?: Date;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
}

export interface UpdateUserRequest {
  name: string;
  email: string;
  password?: string;
  active: boolean;
}
