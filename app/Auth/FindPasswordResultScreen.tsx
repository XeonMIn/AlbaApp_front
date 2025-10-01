import React from "react";
import { View, Text, Pressable, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function FindPasswordResultScreen({ route, navigation }: any) {
    const { email } = route.params;

    return (
        <View style={s.container}>
            {/* 뒤로가기 */}
            <TouchableOpacity style={s.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="chevron-back" size={28} color="black" />
            </TouchableOpacity>

            <Text style={s.title}>비밀번호 재설정 안내</Text>
            <Text style={s.resultText}>
                입력하신 이메일 {"\n"}<Text style={s.highlight}>{email}</Text>{"\n"}로
                비밀번호 재설정 링크를 전송했습니다.
            </Text>

            <Pressable style={s.button} onPress={() => navigation.navigate("Login")}>
                <Text style={s.buttonText}>로그인 화면으로</Text>
            </Pressable>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#fff" },
    backButton: { marginTop: 20, marginBottom: 10 },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 30, textAlign: "center" },
    resultText: { fontSize: 18, textAlign: "center", marginBottom: 20 },
    highlight: { fontWeight: "bold", fontSize: 20, color: "#111" },
    button: { backgroundColor: "#111", padding: 16, borderRadius: 10, alignItems: "center" },
    buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
