import { api } from "@/lib/axios";

export interface LoginResponse {
  accessToken: string;
  username: string;
  // DummyJSON returns more fields (id, email, etc.) — we only use what we need.
}

export async function loginRequest(username: string, password: string) {
  // DummyJSON's /auth/login endpoint. On wrong credentials this rejects,
  // and our axios interceptor turns that into a clean Error with a message.
  const { data } = await api.post<LoginResponse>("/auth/login", {
    username,
    password,
  });
  return data;
}