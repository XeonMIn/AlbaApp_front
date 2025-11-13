// app/utils/axios.ts
import axios, { AxiosInstance } from "axios";
import { Platform } from "react-native";
import Constants from "expo-constants";

/**
 * baseURL 결정 우선순위
 * 1) EXPO_PUBLIC_API_BASE_URL (빌드/런타임 ENV)
 * 2) app.json -> expo.extra.API_BASE_URL
 * 3) Fallback (Android: 10.0.2.2:8081 / iOS: localhost:8081)
 */
const envBase =
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    (Constants?.expoConfig?.extra as any)?.API_BASE_URL ||
    (Constants as any)?.manifest?.extra?.API_BASE_URL;

const fallbackBase =
    Platform.select({
        android: "http://10.0.2.2:8082",
        ios: "http://localhost:8082",
        default: "http://localhost:8082",
    }) || "http://localhost:8082";

const baseURL = envBase || fallbackBase;

/** 공용 axios 인스턴스 */
const api: AxiosInstance = axios.create({
    baseURL,
    headers: { "Content-Type": "application/json" },
    timeout: 15000,
});

/** 전역 Authorization 주입/해제 */
export function setAuthToken(token?: string | null) {
    if (token) {
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common.Authorization;
    }
}

/** (옵션) 공통 응답 인터셉터 — 최소 로깅만, 앱 동작 영향 X */
api.interceptors.response.use(
    (res) => res,
    (error) => Promise.reject(error)
);

export default api;
