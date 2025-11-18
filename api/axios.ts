// api/axios.ts
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { store } from "@/store/store";
import { resetToLogin } from "@/navigation/navigationRef";
import { logout } from "@/store/userSlice";

const API = axios.create({
    baseURL: "http://10.0.2.2:8081", // 백엔드 주소
    timeout: 8000,
});

// 요청 인터셉터: 토큰 자동 첨부
API.interceptors.request.use(async (config) => {
    const token = await SecureStore.getItemAsync("accessToken");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// 응답 인터셉터: 401 → 자동 로그아웃
API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const status = error.response?.status;

        if (status === 401) {
            await SecureStore.deleteItemAsync("accessToken");
            store.dispatch(logout());
            resetToLogin();
        }

        return Promise.reject(error);
    }
);

export default API;
