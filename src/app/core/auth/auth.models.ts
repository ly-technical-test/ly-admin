export interface AuthUser {
  email: string;
  id: string;
  name: string;
}

export interface AuthData {
  access_token: string;
  user: AuthUser;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  name: string;
}
