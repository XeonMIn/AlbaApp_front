import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { loginRequest } from "@/api/auth.api";
import { useDispatch } from "react-redux";
import { setUser } from "@/store/userSlice"; // 경로는 프로젝트 구조에 맞게 조정

export default function LoginScreen({ navigation }: any) {
    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    const handleLogin = async () => {
        if (!userId || !password) {
            return Alert.alert("입력 오류", "아이디와 비밀번호를 입력해주세요.");
        }

        // 임시 로그인 (백엔드 연결 전 Redux 테스트용)
        // if (userId === "eee" && password === "123") {
        //     Alert.alert("로그인 성공", "알바생 계정으로 로그인되었습니다.");
        //
        //     dispatch(
        //         setUser({
        //             userId: "eee",
        //             name: "알바생 테스트 계정",
        //             role: "EMPLOYEE",
        //         })
        //     );
        //
        //     navigation.replace("EmployeeHome");
        //     return;
        // } else if (userId === "ooo" && password === "123") {
        //     Alert.alert("로그인 성공", "사장님 계정으로 로그인되었습니다.");
        //
        //     dispatch(
        //         setUser({
        //             userId: "ooo",
        //             name: "사장님 테스트 계정",
        //             role: "OWNER",
        //         })
        //     );
        //
        //     navigation.replace("OwnerHome");
        //     return;
        // }

        try {
            setLoading(true);
            const data = await loginRequest(userId, password);


            Alert.alert("로그인 성공", `${data.name}님 환영합니다!`);

            dispatch(
                setUser({
                    id: data.id,
                    userId: data.userId,
                    name: data.name,
                    role: data.role.toUpperCase(),
                    accessToken: data.accessToken,
                })
            );

            if (data.role.toLowerCase() === "employee") {
                navigation.replace("nowork");
            } else {
                navigation.replace("OwnerTabs");
            }
        } catch (error) {
            console.log(error);
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

            <Pressable style={[s.loginButton, loading && { opacity: 0.5 }]} onPress={handleLogin}>
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
