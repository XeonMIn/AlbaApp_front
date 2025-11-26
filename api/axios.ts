// api/axios.ts
import axios, { AxiosError } from "axios";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";
import { store } from "@/store/store";
import { resetToLogin } from "@/navigation/navigationRef";
import { logout } from "@/store/userSlice";

// .env > app.json extra > 기본값(에뮬레이터) 순서
const ENV_URL =
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    ((Constants?.expoConfig?.extra as any)?.API_BASE_URL) ||
    "http://192.168.219.104:8081";

const API = axios.create({
    baseURL: ENV_URL,
    timeout: 10000,
});

// 요청마다 최신 토큰을 안전하게 붙임(Axios v1 헤더 타입 대응)
API.interceptors.request.use(async (config) => {
    try {
        const token = await SecureStore.getItemAsync("accessToken");
        if (token) {
            if (!config.headers) config.headers = {} as any;
            const h = config.headers as any;
            if (typeof h.set === "function") {
                h.set("Authorization", `Bearer ${token}`);
            } else {
                h.Authorization = `Bearer ${token}`;
            }
        }
    } catch {
        // ignore
    }
    return config;
});

// 401 → 토큰 삭제 + Redux 로그아웃 + 네비 로그인으로
API.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<any>) => {
        const status = error.response?.status;

        if (status === 401) {
            try { await SecureStore.deleteItemAsync("accessToken"); } catch {}
            store.dispatch(logout());
            resetToLogin?.();
        }

        // 디버그 로그(옵션)
        if (!error.response) {
            console.log("[API] Network error or timeout:", error.config?.url);
        } else if (status && status >= 500) {
            console.log("[API] Server error:", status, error.config?.url);
        }

        return Promise.reject(error);
    }
);

export default API;
