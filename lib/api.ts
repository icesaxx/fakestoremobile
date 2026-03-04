import axios, { AxiosHeaders } from "axios";
import useUserStore from "@/stores/user.store";

const api = axios.create({
  baseURL: "https://fakestoreapi.com",
});

api.interceptors.request.use((config) => {
  const token = useUserStore.getState().token;

  if (token) {
    const headers = AxiosHeaders.from(config.headers ?? {});
    headers.set("Authorization", `Bearer ${token}`);
    config.headers = headers;
  }

  return config;
});

export default api;
