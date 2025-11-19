import React, { useState } from "react";
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import API from "@/api/axios";

export default function FindPasswordResultScreen({ route, navigation }: any) {
    const { userId, email } = route.params;
    const [newPassword, setNewPassword] = useState("");

    const handleResetPassword = async () => {
        if (!newPassword.trim()) {
            Alert.alert("오류", "새 비밀번호를 입력해주세요.");
            return;
        }

        try {
            const res = await API.post("/member/resetpassword", {
                userId,
                email,
                newPassword,
            });

            Alert.alert("완료", res.data, [
                { text: "로그인하기", onPress: () => navigation.replace("Login") },
            ]);

        } catch (err) {
            Alert.alert("오류", "비밀번호 변경에 실패했습니다.");
        }
    };


    return (
        <View style={s.container}>
            <TouchableOpacity style={s.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="chevron-back" size={28} color="black" />
            </TouchableOpacity>

            <Text style={s.title}>비밀번호 재설정</Text>

            <Text style={s.resultText}>
                <Text style={s.highlight}>{userId}</Text> 계정의 새 비밀번호를 입력하세요.
            </Text>

            <TextInput
                style={s.input}
                placeholder="새 비밀번호"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
            />

            <Pressable style={s.button} onPress={handleResetPassword}>
                <Text style={s.buttonText}>비밀번호 변경</Text>
            </Pressable>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#fff" },
    backButton: { marginTop: 20, marginBottom: 10 },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
    resultText: { fontSize: 16, textAlign: "center", marginBottom: 20, color: "#555" },
    highlight: { fontWeight: "bold", fontSize: 18, color: "#111" },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        padding: 14,
        borderRadius: 10,
        backgroundColor: "#f8f8f8",
        marginBottom: 20,
    },
    button: {
        backgroundColor: "#007AFF",
        padding: 16,
        borderRadius: 10,
        alignItems: "center",
    },
    buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
