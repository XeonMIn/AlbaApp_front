import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    Pressable,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function FindIdScreen({ navigation }: any) {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");

    const handleFindId = () => {
        // 실제 API 호출 → 서버에서 이름/전화번호/이메일로 아이디 조회
        const foundId = "testUser01";
        navigation.navigate("FindIdResult", { userId: foundId });
    };

    return (
        <View style={s.container}>
            {/* 뒤로가기 */}
            <TouchableOpacity style={s.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="chevron-back" size={28} color="black" />
            </TouchableOpacity>

            {/* 제목 */}
            <Text style={s.title}>아이디 찾기</Text>

            {/* 입력 필드 */}
            <TextInput
                style={s.input}
                placeholder="이름"
                value={name}
                onChangeText={setName}
            />
            <TextInput
                style={s.input}
                placeholder="전화번호"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
            />
            <TextInput
                style={s.input}
                placeholder="이메일"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
            />

            {/* 아이디 찾기 버튼 */}
            <Pressable style={s.button} onPress={handleFindId}>
                <Text style={s.buttonText}>아이디 찾기</Text>
            </Pressable>

            {/* 비밀번호 찾기 링크 */}
            <Pressable
                style={s.findPasswordLink}
                onPress={() => navigation.navigate("FindPassword")}
            >
                <Text style={s.findPasswordText}>비밀번호 찾기</Text>
            </Pressable>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff", padding: 20 },
    backButton: { marginTop: 20, marginBottom: 10, width: 40 },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "left",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 10,
        padding: 14,
        marginBottom: 12,
        backgroundColor: "#f9f9f9",
    },
    button: {
        backgroundColor: "#111",
        padding: 16,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 10,
    },
    buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
    findPasswordLink: {
        alignSelf: "flex-end",
        marginTop: 10,
    },
    findPasswordText: {
        color: "#6c757d",
        fontSize: 14,
    },
});
