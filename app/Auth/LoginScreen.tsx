import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import axios from "axios";

export default function LoginScreen({ navigation }: any) {
    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!userId || !password) {
            return Alert.alert("입력 오류", "아이디와 비밀번호를 입력해주세요.");
        }

        try {
            setLoading(true);
            const response = await axios.post("http://10.0.2.2:8080/api/login", {
                userId,
                password,
            });

            const data = response.data;

            if (data.success) {
                Alert.alert("로그인 성공", `${data.userName}님 환영합니다!`);

                // JWT 토큰 저장 (선택사항)
                // import * as SecureStore from "expo-secure-store";
                // await SecureStore.setItemAsync("jwt", data.token);

                // 사용자 유형에 따라 분기 이동
                if (data.userType === "employee") {
                    navigation.replace("EmployeeHome");
                } else if (data.userType === "owner") {
                    navigation.replace("OwnerHome");
                } else {
                    Alert.alert("알 수 없는 사용자 유형입니다.");
                }
            } else {
                Alert.alert("로그인 실패", "아이디 또는 비밀번호가 올바르지 않습니다.");
            }
        } catch (error: any) {
            console.error(error);
            Alert.alert("서버 오류", "로그인 요청 중 문제가 발생했습니다.");
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
