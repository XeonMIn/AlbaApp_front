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
import API from "@/api/axios";

export default function FindAccountScreen({ navigation }: any) {
    const [tab, setTab] = useState<"id" | "password">("id");

    // 아이디 찾기 상태 관리
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [findIdEmail, setFindIdEmail] = useState("");

    // 비밀번호 찾기 상태 관리
    const [userId, setUserId] = useState("");
    const [findPwEmail, setFindPwEmail] = useState("");

    // 아이디 찾기
    const handleFindId = async () => {
        if (name.trim() === "" || phone.trim() === "" || findIdEmail.trim() === "") {
            Alert.alert("입력 오류", "모든 항목을 입력해주세요.");
            return;
        }

        try {
            const response = await axios.post("http://10.0.2.2:8081/member/findid", {
                name: name.trim(),
                email: findIdEmail.trim(),
                phoneNumber: phone.trim(),
            });

            const data = response.data;

            if (data.userId) {
                navigation.navigate("FindIdResult", { userId: data.userId });
            } else {
                Alert.alert("조회 실패", "회원 정보를 찾을 수 없습니다.");
            }
        } catch (error) {
            Alert.alert("조회 실패", "회원 정보를 찾을 수 없습니다.");
        }
    };

    // 비밀번호 찾기
    const handleFindPassword = async () => {
        if (userId.trim() === "" || findPwEmail.trim() === "") {
            Alert.alert("입력 오류", "아이디와 이메일을 모두 입력해주세요.");
            return;
        }
        // ★ 여기 로그 추가
        console.log("보내는 userId = [" + userId.trim() + "]");
        console.log("보내는 email = [" + findPwEmail.trim() + "]");

        try {
            const res = await API.post("/member/check-password-user", {
                userId: userId.trim(),
                email: findPwEmail.trim(),
            });

            if (res.data.valid) {
                navigation.navigate("FindPasswordResult", {
                    userId: userId.trim(),
                    email: findPwEmail.trim(),
                });
            } else {
                Alert.alert("오류", "아이디 또는 이메일이 일치하지 않습니다.");
            }
        } catch (err) {
            Alert.alert("오류", "아이디 또는 이메일이 일치하지 않습니다.");
        }
    };

    return (
        <View style={s.container}>
            {/* 뒤로가기 */}
            <TouchableOpacity style={s.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="chevron-back" size={28} color="black" />
            </TouchableOpacity>

            {/* 제목 */}
            <Text style={s.title}>아이디/비밀번호 찾기</Text>

            {/* 탭 버튼 */}
            <View style={s.tabRow}>
                <Pressable
                    style={[s.tabButton, tab === "id" && s.tabActive]}
                    onPress={() => setTab("id")}
                >
                    <Text style={[s.tabText, tab === "id" && s.tabTextActive]}>
                        아이디 찾기
                    </Text>
                </Pressable>

                <Pressable
                    style={[s.tabButton, tab === "password" && s.tabActive]}
                    onPress={() => setTab("password")}
                >
                    <Text style={[s.tabText, tab === "password" && s.tabTextActive]}>
                        비밀번호 찾기
                    </Text>
                </Pressable>
            </View>

            {/* 아이디 찾기 UI */}
            {tab === "id" && (
                <View>
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
                        value={findIdEmail}
                        onChangeText={setFindIdEmail}
                        keyboardType="email-address"
                    />

                    <Pressable style={s.button} onPress={handleFindId}>
                        <Text style={s.buttonText}>아이디 찾기</Text>
                    </Pressable>
                </View>
            )}

            {/* 비밀번호 찾기 UI */}
            {tab === "password" && (
                <View>
                    <TextInput
                        style={s.input}
                        placeholder="아이디"
                        value={userId}
                        onChangeText={setUserId}
                    />
                    <TextInput
                        style={s.input}
                        placeholder="이메일"
                        value={findPwEmail}
                        onChangeText={setFindPwEmail}
                        keyboardType="email-address"
                    />

                    <Pressable style={s.button} onPress={handleFindPassword}>
                        <Text style={s.buttonText}>비밀번호 재설정</Text>
                    </Pressable>
                </View>
            )}
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff", padding: 20 },
    backButton: { marginTop: 20, marginBottom: 10 },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
    tabRow: { flexDirection: "row", marginBottom: 20 },
    tabButton: {
        flex: 1,
        padding: 12,
        alignItems: "center",
        borderBottomWidth: 2,
        borderBottomColor: "#ddd",
    },
    tabActive: { borderBottomColor: "#111" },
    tabText: { fontSize: 16, color: "#666" },
    tabTextActive: { color: "#111", fontWeight: "bold" },
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
});
