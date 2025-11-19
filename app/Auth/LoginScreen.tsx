import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    Pressable,
    StyleSheet,
    Alert,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { loginRequest } from "@/api/auth.api";
import { useDispatch } from "react-redux";
import { setUser } from "@/store/userSlice";

type LoginResponse = {
    id: number;
    userId: string;
    name: string;
    email?: string | null;
    phoneNumber?: string | null;
    role: string; // "ALBA" | "CEO" | "OWNER" | ...
    accessToken: string;
    workplaceId?: number | null;
    workplaceName?: string | null;
};

export default function LoginScreen({ navigation }: any) {
    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    const handleLogin = async () => {
        if (!userId || !password) {
            Alert.alert("입력 오류", "아이디와 비밀번호를 입력해주세요.");
            return;
        }

        try {
            setLoading(true);

            // 🔐 백엔드 로그인
            const data = (await loginRequest(userId, password)) as LoginResponse;

            // 토큰 저장(자동로그인용)
            await SecureStore.setItemAsync("accessToken", data.accessToken);

            // 역할 정규화
            const rawRole = (data.role ?? "").toString();
            const upperRole = rawRole.toUpperCase(); // "ALBA" | "CEO" | "OWNER" | ...

            const isOwner =
                upperRole === "CEO" || upperRole === "OWNER" || upperRole === "BOSS";
            const isEmployee =
                upperRole === "ALBA" ||
                upperRole === "EMPLOYEE" ||
                rawRole.toLowerCase() === "employee";

            // 매장 보유 여부
            const hasWorkplace =
                data.workplaceId !== null && data.workplaceId !== undefined;

            // ✅ Redux 저장 (isLoggedIn은 리듀서 내부에서 true로 세팅됨!)
            dispatch(
                setUser({
                    id: data.id,
                    userId: data.userId,
                    name: data.name,
                    role: upperRole,
                    email: data.email ?? null,
                    phoneNumber: data.phoneNumber ?? null,
                    accessToken: data.accessToken,
                })
            );

            Alert.alert("로그인 성공", `${data.name}님 환영합니다!`);

            // 네비게이션 분기 (대칭 처리)
            if (isOwner && hasWorkplace) {
                navigation.reset({ index: 0, routes: [{ name: "OwnerTabs" }] });
            } else if (isOwner && !hasWorkplace) {
                navigation.replace("OwnerEmpty"); // 또는 "OwnerEmpty"
            } else if (isEmployee && hasWorkplace) {
                navigation.reset({ index: 0, routes: [{ name: "EmployeeTabs" }] });
            } else {
                navigation.replace("EmployeeNoWorkplace");
            }
        } catch (error) {
            console.log("로그인 에러:", error);
            Alert.alert("로그인 실패", "아이디 또는 비밀번호를 확인해주세요.");
            try {
                await SecureStore.deleteItemAsync("accessToken");
            } catch {}
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

            <Pressable
                style={[s.loginButton, loading && { opacity: 0.5 }]}
                onPress={handleLogin}
                disabled={loading}
            >
                <Text style={s.loginButtonText}>
                    {loading ? "로그인 중..." : "로그인"}
                </Text>
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
    container: {
        flex: 1,
        justifyContent: "center",
        padding: 20,
        backgroundColor: "#fff",
    },
    title: { fontSize: 26, fontWeight: "bold", marginBottom: 30, textAlign: "center" },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 10,
        padding: 14,
        marginBottom: 12,
        backgroundColor: "#f9f9f9",
    },
    loginButton: {
        backgroundColor: "#111",
        padding: 16,
        borderRadius: 10,
        alignItems: "center",
        marginVertical: 10,
    },
    loginButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
    linkRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
    linkText: { color: "#6c757d", fontSize: 14 },
});
