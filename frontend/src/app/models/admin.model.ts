export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  admin: {
    id: string;
    name: string;
    email: string;
  };
}
