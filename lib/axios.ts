import axios from "axios";
import { getToken, clearSession } from "./auth";

// This is the ONLY axios instance the app uses. Every service file imports
// this instead of calling axios directly, so the token attachment and error
// handling below apply everywhere automatically.
export const api = axios.create({
  baseURL: "https://dummyjson.com",
});

// Request interceptor: attach the login token to every outgoing request,
// if we have one. DummyJSON expects it as a Bearer token.
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle errors in one place instead of writing
// try/catch boilerplate around every single API call in the app.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token missing/expired/rejected — clear the session so the user is
      // sent back to the login screen instead of seeing a broken page.
      clearSession();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    // Re-throw a normalized error so calling code can just read `.message`.
    const message =
      error.response?.data?.message || error.message || "Something went wrong.";
    return Promise.reject(new Error(message));
  }
);