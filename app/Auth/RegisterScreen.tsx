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
import api from "../utils/axios"; // ✅ 공용 axios 인스턴스(8082는 utils/axios.ts에서 설정)
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
    const [businessLicense, setBusinessLicense] = useState(""); // 사장님 전용(표시만, 전송은 제외)
    const [userType, setUserType] = useState<"owner" | "employee">("employee");
    const [loading, setLoading] = useState(false);

    // 문자열/JSON 어떤 응답도 수용
    const normalizeSignup = (raw: any) => {
        if (typeof raw === "string") {
            const s = raw.trim().toLowerCase();
            if (!s) return { ok: false, message: "빈 응답" };
            if (["ok", "success", "created", "true", "성공"].some(k => s.includes(k))) {
                return { ok: true, message: raw };
            }
            // 문자열에 "이미 존재" 포함 시 중복으로 간주
            if (s.includes("이미") && s.includes("존재")) {
                return { ok: false, message: "이미 존재하는 아이디입니다." };
            }
            // 기타 문자열도 HTTP 2xx라면 성공으로 처리
            return { ok: true, message: raw };
        }

        if (raw && typeof raw === "object") {
            if (typeof raw.success !== "undefined") {
                return { ok: !!raw.success, message: raw.message ?? "회원가입 처리됨" };
            }
            if (raw.userId || raw.id || raw.member || raw.data) {
                return { ok: true, message: "회원가입 완료" };
            }
            return { ok: true, message: "회원가입 처리됨" };
        }

        return { ok: false, message: "서버 응답을 해석할 수 없습니다." };
    };

    const handleRegister = async () => {
        if (!userId || !password || !confirmPassword || !email || !name || !phoneNumber) {
            return Alert.alert("입력 오류", "필수 항목을 모두 입력해주세요.");
        }
        if (password !== confirmPassword) {
            return Alert.alert("비밀번호 오류", "비밀번호가 일치하지 않습니다.");
        }

        try {
            setLoading(true);

            /**
             * ✅ 백엔드 전송 payload
             * - businessLicense(사업자번호)는 전송에서 제외 (UI에는 표시만 유지)
             * - role: 'owner'|'employee' (소문자)
             * - birthdate는 서버 DTO 맞춤 기본값
             */
            const payload: Record<string, any> = {
                userId,
                password,
                name,
                email,
                phoneNumber,
                role: userType, // "owner" | "employee"
                birthdate: "2000-01-01",
                // ❌ businessLicense는 의도적으로 전송하지 않음
            };

            // 서버가 text 응답을 반환할 수도 있어 responseType: 'text'
            const res = await api.post("/member/signup", payload, { responseType: "text" });

            let raw: any = res?.data;
            if (typeof raw === "string" && raw.trim().startsWith("{")) {
                try { raw = JSON.parse(raw); } catch {}
            }

            const { ok, message } = normalizeSignup(raw);

            if (!ok) {
                Alert.alert("회원가입 실패", message || "회원가입 중 문제가 발생했습니다.");
                return;
            }

            Alert.alert("회원가입 완료", "이제 로그인 해주세요.");
            navigation.replace("Login");
        } catch (error: any) {
            console.error("회원가입 오류:", error?.response?.status, error?.response?.data);
            const dataStr: string | undefined = error?.response?.data;
            if (error?.response?.status === 409 || (typeof dataStr === "string" && dataStr.includes("이미 존재"))) {
                Alert.alert("회원가입 실패", "이미 존재하는 아이디입니다.");
            } else {
                Alert.alert("서버 오류", "회원가입 요청 중 문제가 발생했습니다.");
            }
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
                autoCapitalize="none"
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
