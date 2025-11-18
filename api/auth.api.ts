// api/auth.api.ts
import API from "./axios";
import * as SecureStore from "expo-secure-store";

//로그인
export async function loginRequest(userId: string, password: string) {
    const res = await API.post("/member/login", { userId, password });
    const data = res.data;

    // 토큰 저장
    if (data.accessToken) {
        await SecureStore.setItemAsync("accessToken", data.accessToken);
    }

    return data;
}
//회원가입
export async function registerRequest(form: {
    userId: string;
    password: string;
    name: string;
    email: string;
    phoneNumber: string;
    birthdate: string;
    role: string;

}) {
    const res = await API.post("/member/signup", form);
    return res.data;
}


