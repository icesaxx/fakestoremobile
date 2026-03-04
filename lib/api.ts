import axios, { AxiosHeaders } from "axios";
import useUserStore from "@/stores/user.store";

const api = axios.create({
  baseURL: "https://fakestoreapi.com",
});

api.interceptors.request.use((config) => {
  const token = useUserStore.getState().token;

  if (token) {
    if (config.headers instanceof AxiosHeaders) {
      config.headers.set("Authorization", `Bearer ${token}`);
    } else {
      config.headers = {
        ...(config.headers ?? {}),
        Authorization: `Bearer ${token}`,
      };
    }
  }

  return config;
});

export default api;
