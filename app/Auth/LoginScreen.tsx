import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";

export default function LoginScreen({ navigation }: any) {
    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = () => {
        alert(`로그인 시도\n아이디: ${userId}`);
        // 로그인 성공 시 -> navigation.navigate("Home");
    };

    return (
        <View style={s.container}>
            {/* 앱 제목 */}
            <Text style={s.title}>스마트 알바 매니저 앱</Text>

            {/* 입력 필드 */}
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

            {/* 로그인 버튼 */}
            <Pressable style={s.loginButton} onPress={handleLogin}>
                <Text style={s.loginButtonText}>로그인</Text>
            </Pressable>

            {/* 회원가입 / 아이디 찾기 / 비밀번호 찾기 */}
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
    linkRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10,
    },
    linkText: { color: "#6c757d", fontSize: 14 },
});
