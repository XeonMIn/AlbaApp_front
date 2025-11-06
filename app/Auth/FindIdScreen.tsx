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

export default function FindIdScreen({ navigation }: any) {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleFindId = async () => {
        if (!name || !phone || !email) {
            return Alert.alert("입력 오류", "모든 항목을 입력해주세요.");
        }

        try {
            setLoading(true);

            // ✅ 백엔드 요청 (POST)
            const response = await axios.post("http://10.0.2.2:8081/member/findid", {
                name: name,
                email: email,
                phoneNumber: phone, // ⚠️ 백엔드 필드 이름과 일치해야 함
            });

            console.log("서버 응답:", response.data);

            const data = response.data;

            // ✅ 정상 응답 처리
            if (data.userId) {
                navigation.navigate("FindIdResult", { userId: data.userId });
            } else {
                Alert.alert("조회 실패", "회원 정보를 찾을 수 없습니다.");
            }
        } catch (error: any) {
            console.error("아이디 찾기 오류:", error.response?.data || error.message);
            Alert.alert("조회 실패", error.response?.data || "회원 정보를 찾을 수 없습니다.");
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
            <Pressable
                style={[s.button, loading && { opacity: 0.6 }]}
                onPress={handleFindId}
                disabled={loading}
            >
                <Text style={s.buttonText}>
                    {loading ? "조회 중..." : "아이디 찾기"}
                </Text>
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
