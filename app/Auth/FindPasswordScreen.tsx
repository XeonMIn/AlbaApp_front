import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    Pressable,
    StyleSheet,
    TouchableOpacity,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";

export default function FindPasswordScreen({ navigation }: any) {
    const [userId, setUserId] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleFindPassword = async () => {
        if (userId.trim() === "" || email.trim() === "") {
            Alert.alert("입력 오류", "아이디와 이메일을 모두 입력해주세요.");
            return;
        }


        try {
            setLoading(true);

            // 1) 아이디+이메일 검증
            const checkRes = await axios.post(
                "http://10.0.2.2:8081/member/check-password-user",
                {
                    userId: userId.trim(),
                    email: email.trim(),
                }
            );

            if (!checkRes.data.valid) {
                Alert.alert("오류", "아이디 또는 이메일이 일치하지 않습니다.");
                return;
            }

            // 2) 검증 성공 → 새 비밀번호 입력 화면으로 이동
            navigation.navigate("FindPasswordResult", {
                userId,
                email
            });

        } catch (_) {
            Alert.alert("오류", "서버 요청 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <View style={s.container}>
            {/* 뒤로가기 */}
            <TouchableOpacity style={s.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="chevron-back" size={28} color="black" />
            </TouchableOpacity>

            <Text style={s.title}>비밀번호 찾기</Text>

            <TextInput
                style={s.input}
                placeholder="아이디"
                placeholderTextColor="#999"
                value={userId}
                onChangeText={(text) => setUserId(text)}
            />

            <TextInput
                style={s.input}
                placeholder="이메일"
                placeholderTextColor="#999"
                value={email}
                onChangeText={(text) => setEmail(text)}
                keyboardType="email-address"
            />

            <Pressable style={s.button} onPress={handleFindPassword}>
                <Text style={s.buttonText}>
                    {loading ? "처리 중..." : "비밀번호 재설정"}
                </Text>
            </Pressable>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#fff" },
    backButton: { marginTop: 20, marginBottom: 10 },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        padding: 14,
        marginBottom: 12,
    },
    button: {
        backgroundColor: "#111",
        padding: 16,
        borderRadius: 10,
        alignItems: "center",
    },
    buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
