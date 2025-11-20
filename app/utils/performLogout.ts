// app/utils/performLogout.ts
import * as SecureStore from "expo-secure-store";
import { logout } from "@/store/userSlice";
import { store } from "@/store/store";

export async function performLogout(navigation: any) {
    try { await SecureStore.deleteItemAsync("accessToken"); } catch {}
    store.dispatch(logout());
    // (필요하면 WebSocket 끊기 등 추가)
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
}
