// app/utils/axios-setup.ts
import axios from "axios";
import { Platform } from "react-native";
import Constants from "expo-constants";

const envBase =
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    (Constants?.expoConfig?.extra as any)?.API_BASE_URL ||
    (Constants as any)?.manifest?.extra?.API_BASE_URL;

const fallbackBase =
    Platform.select({
        android: "http://10.0.2.2:8081",
        ios: "http://localhost:8081",
        default: "http://localhost:8081",
    }) || "http://localhost:8081";

const baseURL = envBase || fallbackBase;

export function setupAxios() {
    axios.defaults.baseURL = baseURL;
    axios.defaults.headers.common["Content-Type"] = "application/json";
}

export function setAuthToken(token?: string | null) {
    if (token) {
        axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
        delete axios.defaults.headers.common.Authorization;
    }
}
