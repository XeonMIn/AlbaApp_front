import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ScrollView,
} from "react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigators/RootNavigator";

type RegisterScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    "Register"
>;

export default function RegisterScreen() {
    const navigation = useNavigation<RegisterScreenNavigationProp>();

    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [businessLicense, setBusinessLicense] = useState(""); // 사장님 전용
    const [userType, setUserType] = useState<"owner" | "employee">("employee");
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!userId || !password || !confirmPassword || !email || !name || !phoneNumber) {
            return Alert.alert("입력 오류", "필수 항목을 모두 입력해주세요.");
        }
        if (password !== confirmPassword) {
            return Alert.alert("비밀번호 오류", "비밀번호가 일치하지 않습니다.");
        }

        try {
            setLoading(true);

            const response = await axios.post("http://10.0.2.2:8081/member/signup", {
                userid: userId,                // ✅ 백엔드 DTO 필드 이름과 통일
                password: password,
                name: name,
                email: email,
                phone: phoneNumber,
                role: userType === "owner" ? "OWNER" : "EMPLOYEE",  // ✅ role 필드 채우기
                birthdate: "2000-01-01",       // ✅ 테스트용으로 임시 값 (나중에 입력 필드 추가 가능)
                businessLicense: userType === "owner" ? businessLicense : null
            });

            const data = response.data;

            if (data.success) {
                Alert.alert("회원가입 완료", data.message || "회원가입이 완료되었습니다.");
                navigation.replace("Login");
            } else {
                Alert.alert("회원가입 실패", data.message || "이미 존재하는 아이디입니다.");
            }
        } catch (error: any) {
            console.error(error);
            Alert.alert("서버 오류", "회원가입 요청 중 문제가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={s.container}>
            <Text style={s.title}>회원가입</Text>

            {/* 직책 선택 */}
            <View style={s.toggleContainer}>
                <TouchableOpacity
                    style={[s.toggleButton, userType === "employee" && s.toggleActive]}
                    onPress={() => setUserType("employee")}
                >
                    <Text style={[s.toggleText, userType === "employee" && s.toggleTextActive]}>
                        알바생
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[s.toggleButton, userType === "owner" && s.toggleActive]}
                    onPress={() => setUserType("owner")}
                >
                    <Text style={[s.toggleText, userType === "owner" && s.toggleTextActive]}>
                        사장님
                    </Text>
                </TouchableOpacity>
            </View>

            {/* 공통 입력 필드 */}
            <TextInput
                placeholder="아이디"
                style={s.input}
                value={userId}
                onChangeText={setUserId}
            />

            <TextInput
                placeholder="비밀번호"
                style={s.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <TextInput
                placeholder="비밀번호 확인"
                style={s.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
            />

            <TextInput
                placeholder="이메일"
                style={s.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />

            <TextInput
                placeholder="이름"
                style={s.input}
                value={name}
                onChangeText={setName}
            />

            <TextInput
                placeholder="전화번호"
                style={s.input}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
            />

            {/* 사장님 전용 입력 필드 */}
            {userType === "owner" && (
                <TextInput
                    placeholder="사업자 등록번호"
                    style={s.input}
                    value={businessLicense}
                    onChangeText={setBusinessLicense}
                />
            )}

            {/* 회원가입 버튼 */}
            <TouchableOpacity
                style={[s.button, loading && { opacity: 0.6 }]}
                onPress={handleRegister}
                disabled={loading}
            >
                <Text style={s.buttonText}>{loading ? "등록 중..." : "회원가입"}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={s.link}>로그인으로 돌아가기</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const s = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: "#fff",
        flexGrow: 1,
        justifyContent: "center",
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 24,
    },
    input: {
        height: 50,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 16,
        paddingHorizontal: 10,
    },
    toggleContainer: {
        flexDirection: "row",
        marginBottom: 20,
    },
    toggleButton: {
        flex: 1,
        padding: 12,
        borderWidth: 1,
        borderColor: "#111",
        borderRadius: 8,
        marginRight: 8,
        alignItems: "center",
    },
    toggleActive: {
        backgroundColor: "#111",
    },
    toggleText: {
        color: "#111",
    },
    toggleTextActive: {
        color: "#fff",
        fontWeight: "bold",
    },
    button: {
        backgroundColor: "#111",
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 8,
    },
    buttonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
    },
    link: {
        marginTop: 16,
        textAlign: "center",
        color: "#555",
    },
});
