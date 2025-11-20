import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    Pressable,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { useDispatch } from "react-redux";
import { setUser } from "@/store/userSlice";
import { loginRequest } from "@/api/auth.api";
import API from "@/api/axios";

export default function LoginScreen({ navigation }: any) {
    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    const handleLogin = async () => {
        if (!userId.trim() || !password.trim()) {
            Alert.alert("입력 오류", "아이디와 비밀번호를 입력해주세요.");
            return;
        }

        try {
            setLoading(true);

            // 1) 로그인 → 토큰 수령
            const loginRes = await loginRequest(userId, password);
            const token: string = (loginRes as any)?.accessToken;
            if (!token) throw new Error("토큰이 없습니다.");

            // 2) 토큰 저장(대기까지 보장)
            await SecureStore.setItemAsync("accessToken", token);

            // 3) 내 정보 재조회(항상 최신, 이 호출에 토큰 직접 첨부해서 레이스 방지)
            const meRes = await API.get("/member/me", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const me = meRes.data;

            const role = String(me.role ?? "").toUpperCase();
            const hasWorkplace = me.workplaceId !== null && me.workplaceId !== undefined;

            // 4) Redux 저장 (workplace 즉시 반영)
            dispatch(
                setUser({
                    id: me.id,
                    userId: me.userId,
                    name: me.name,
                    role,
                    email: me.email ?? null,
                    phoneNumber: me.phoneNumber ?? null,
                    accessToken: token,
                    workplaceId: hasWorkplace ? me.workplaceId : null,
                    workplaceName: hasWorkplace ? me.workplaceName : null,
                } as any)
            );

            // 5) 네비게이션 분기(RESET로 화면 스택 초기화)
            if ((role === "ALBA" || role === "EMPLOYEE") && hasWorkplace) {
                navigation.reset({ index: 0, routes: [{ name: "EmployeeTabs" }] });
            } else if (role === "ALBA" || role === "EMPLOYEE") {
                navigation.reset({ index: 0, routes: [{ name: "EmployeeNoWorkplace" }] });
            } else if (hasWorkplace) {
                navigation.reset({ index: 0, routes: [{ name: "OwnerTabs" }] });
            } else {
                navigation.reset({ index: 0, routes: [{ name: "OwnerEmpty" }] });
            }
        } catch (err: any) {
            console.log("로그인 실패:", err?.response?.data || err?.message);
            Alert.alert("로그인 실패", err?.response?.data?.message || "아이디/비밀번호를 확인하세요.");
            try { await SecureStore.deleteItemAsync("accessToken"); } catch {}
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={s.container}>
            <Text style={s.title}>알바 매니저 앱</Text>

            <TextInput
                style={s.input}
                placeholder="아이디"
                value={userId}
                onChangeText={setUserId}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
            />
            <TextInput
                style={s.input}
                placeholder="비밀번호"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
            />

            <Pressable style={[s.loginButton, loading && { opacity: 0.5 }]} onPress={handleLogin} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.loginButtonText}>로그인</Text>}
            </Pressable>

            <View style={s.linkRow}>
                <Pressable onPress={() => navigation.navigate("Register")}>
                    <Text style={s.linkText}>회원가입</Text>
                </Pressable>
                <Pressable onPress={() => navigation.navigate("FindAccount")}>
                    <Text style={s.linkText}>아이디/비밀번호 찾기</Text>
                </Pressable>
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#fff" },
    title: { fontSize: 26, fontWeight: "bold", marginBottom: 30, textAlign: "center" },
    input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 14, marginBottom: 12, backgroundColor: "#f9f9f9" },
    loginButton: { backgroundColor: "#111", padding: 16, borderRadius: 10, alignItems: "center", marginVertical: 10 },
    loginButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
    linkRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
    linkText: { color: "#6c757d", fontSize: 14 },
});
