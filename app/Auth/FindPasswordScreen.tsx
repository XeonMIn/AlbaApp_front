import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function FindPasswordScreen({ navigation }: any) {
    const [userId, setUserId] = useState("");
    const [email, setEmail] = useState("");

    const handleFindPassword = () => {
        // 실제 API 연동 필요
        navigation.navigate("FindPasswordResult", { email });
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
                value={userId}
                onChangeText={setUserId}
            />
            <TextInput
                style={s.input}
                placeholder="가입 시 등록한 이메일"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
            />
            <Pressable style={s.button} onPress={handleFindPassword}>
                <Text style={s.buttonText}>비밀번호 재설정</Text>
            </Pressable>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#fff" },
    backButton: { marginTop: 20, marginBottom: 10 },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
    input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 10, padding: 14, marginBottom: 12 },
    button: { backgroundColor: "#111", padding: 16, borderRadius: 10, alignItems: "center" },
    buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
