import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert, Platform } from "react-native";
import axios from "axios";
import Constants from "expo-constants";
import { useDispatch } from "react-redux";
import { setUser } from "../../store/userSlice";

export default function LoginScreen({ navigation }: any) {
    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    // ✅ 데모 모드: true면 백엔드 호출 없이 테스트 계정만 동작
    const DEMO_MODE = true;

    // axios.ts 없이도 안정적인 BASE_URL (백엔드 연결 시 사용)
    const BASE_URL = (() => {
        const env = process.env.EXPO_PUBLIC_API_BASE_URL;
        if (env && env.trim()) return env.trim();
        const extra: any = Constants?.expoConfig?.extra ?? Constants?.manifest?.extra ?? {};
        if (extra?.API_BASE_URL && typeof extra.API_BASE_URL === "string") return extra.API_BASE_URL.trim();
        const host = Platform.OS === "android" ? "10.0.2.2" : "localhost";
        return `http://${host}:8081`;
    })();

    // 안전한 화면 전환(스택 초기화)
    const resetTo = (name: "OwnerHome" | "EmployeeHome" | "EmployeeNoWorkplace") => {
        navigation.reset({ index: 0, routes: [{ name }] });
    };

    // 알바(EMPLOYEE) 랜딩: 소속 매장 확인 후 분기
    const goEmployeeLanding = async () => {
        if (DEMO_MODE) {
            // ✅ 데모에서는 소속 없음으로 가정 → 매장 코드 입력 플로우
            return resetTo("EmployeeNoWorkplace");
        }
        try {
            const res = await axios.get(`${BASE_URL}/employment/my`);
            const list = Array.isArray(res.data) ? res.data : (res.data?.items ?? res.data?.data ?? []);
            if (!list || list.length === 0) resetTo("EmployeeNoWorkplace");
            else resetTo("EmployeeHome");
        } catch {
            resetTo("EmployeeNoWorkplace");
        }
    };

    // 알럿 OK 버튼에서 전환(타이밍 이슈 방지)
    const successAlertThen = (msg: string, onOk: () => void) => {
        Alert.alert("로그인 성공", msg, [{ text: "확인", onPress: onOk }], { cancelable: false });
    };

    const handleLogin = async () => {
        if (!userId || !password) {
            return Alert.alert("입력 오류", "아이디와 비밀번호를 입력해주세요.");
        }

        setLoading(true);
        try {
            // ✅ 테스트 계정 분기 (백엔드 호출 없음)
            if (userId === "eee" && password === "123") {
                dispatch(setUser({ userId: "eee", name: "알바생 테스트 계정", role: "EMPLOYEE" }));
                return successAlertThen("알바생 계정으로 로그인되었습니다.", () => { goEmployeeLanding(); });
            }
            if (userId === "ooo" && password === "123") {
                dispatch(setUser({ userId: "ooo", name: "사장님 테스트 계정", role: "OWNER" }));
                return successAlertThen("사장님 계정으로 로그인되었습니다.", () => { resetTo("OwnerHome"); });
            }

            // ✅ 데모 모드에서는 다른 계정 불가 (아래의 백엔드 로직은 보존만)
            if (DEMO_MODE) {
                return Alert.alert("로그인 실패", "데모 모드에서는 eee/123 또는 ooo/123만 사용할 수 있어요.");
            }

            // ──────────────────────────────────────────────
            // ↓↓↓ 여기부터는 추후 백엔드 연동 재개 시 활성화 ↓↓↓
            const response = await axios.post(`${BASE_URL}/member/login`, { userId, password });
            const data = response.data;

            const token = data?.accessToken ?? data?.token ?? null;
            const roleRaw = (data?.member?.role ?? data?.userType ?? "").toString().toLowerCase(); // "owner" | "employee"
            const name = data?.member?.name ?? data?.userName ?? userId;
            const uid = data?.member?.userId ?? data?.userId ?? userId;

            const isSuccess = data?.success === true || !!token || !!data?.member;
            if (!isSuccess) return Alert.alert("로그인 실패", "아이디 또는 비밀번호가 올바르지 않습니다.");

            if (token) axios.defaults.headers.common.Authorization = `Bearer ${token}`;
            dispatch(setUser({ userId: uid, name, role: roleRaw === "owner" ? "OWNER" : "EMPLOYEE" }));

            if (roleRaw === "owner") {
                successAlertThen(`${name}님 환영합니다!`, () => { resetTo("OwnerHome"); });
            } else {
                successAlertThen(`${name}님 환영합니다!`, () => { goEmployeeLanding(); });
            }
            // ↑↑↑ 여기까지 백엔드 연동 코드(보존) ↑↑↑
            // ──────────────────────────────────────────────
        } catch (e) {
            console.error(e);
            Alert.alert("오류", "처리 중 문제가 발생했습니다.");
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
            />
            <TextInput
                style={s.input}
                placeholder="비밀번호"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            <Pressable style={[s.loginButton, loading && { opacity: 0.5 }]} onPress={handleLogin} disabled={loading}>
                <Text style={s.loginButtonText}>{loading ? "로그인 중..." : "로그인"}</Text>
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
