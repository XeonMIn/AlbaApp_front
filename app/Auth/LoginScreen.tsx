import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { loginRequest } from "@/api/auth.api";
import { useDispatch } from "react-redux";
import { setUser } from "@/store/userSlice";

export default function LoginScreen({ navigation }: any) {
    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    const handleLogin = async () => {
        if (!userId || !password) {
            return Alert.alert("입력 오류", "아이디와 비밀번호를 입력해주세요.");
        }

        try {
            setLoading(true);

            // 🔥 백엔드 로그인 요청
            const data: any = await loginRequest(userId, password);

            console.log("### login response:", data);

            // -----------------------------
            // 1) role 정규화
            //    - ALBA / OWNER (백엔드 enum)
            //    - employee / owner (프론트에서 쓸 문자열)
            // 둘 다 대응되게 처리
            // -----------------------------
            const rawRole: string = typeof data.role === "string" ? data.role : "";
            const upperRole = rawRole.toUpperCase(); // ALBA, OWNER, EMPLOYEE 등

            const isEmployee =
                upperRole === "ALBA" || // 백엔드 enum
                upperRole === "EMPLOYEE" || // 혹시 프론트에서 이렇게 바꿨을 수도 있음
                rawRole.toLowerCase() === "employee";

            // -----------------------------
            // 2) 매장 보유 여부 판별
            //    - 백엔드에서 workplaceId 내려주면 그걸 기준으로
            // -----------------------------
            const hasWorkplace =
                data.workplaceId !== null &&
                data.workplaceId !== undefined;

            console.log("isEmployee:", isEmployee, "hasWorkplace:", hasWorkplace);

            Alert.alert("로그인 성공", `${data.name}님 환영합니다!`);

            // -----------------------------
            // 3) Redux에 유저 정보 저장
            //    (기존 기능 유지, workplace는 옵션)
            // -----------------------------
            dispatch(
                setUser({
                    id: data.id,
                    userId: data.userId,
                    name: data.name,
                    role: upperRole,          // ALBA / OWNER / EMPLOYEE ...
                    accessToken: data.accessToken,
                    // userSlice에 이런 필드 미리 안 만들어 놨으면
                    // 아래 두 줄은 아예 빼도 상관 없음
                    workplaceId: hasWorkplace ? data.workplaceId : null,
                    workplaceName: hasWorkplace ? data.workplaceName : null,
                } as any)
            );

            // -----------------------------
            // 4) 실제 네비게이션 분기
            // -----------------------------
            if (isEmployee && hasWorkplace) {
                // ✅ 알바 + 매장 O → 직원 탭
                navigation.replace("EmployeeTabs");
            } else if (isEmployee && !hasWorkplace) {
                // ✅ 알바 + 매장 X → 매장 등록 흐름
                navigation.replace("EmployeeNoWorkplace");
            } else {
                // ✅ 그 외(사장님) → 사장님 탭
                navigation.replace("OwnerTabs");
            }

        } catch (error) {
            console.log("로그인 에러:", error);
            Alert.alert("로그인 실패", "아이디 또는 비밀번호를 확인해주세요.");
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

            <Pressable
                style={[s.loginButton, loading && { opacity: 0.5 }]}
                onPress={handleLogin}
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
    container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#fff" },
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
