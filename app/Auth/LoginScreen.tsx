import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import api from "../utils/axios"; // 공용 axios 인스턴스(네가 8082로 맞춘 파일)
import { useDispatch } from "react-redux";
import { setUser } from "@/store/userSlice"; // 경로는 프로젝트 구조에 맞게 조정

export default function LoginScreen({ navigation }: any) {
    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    // Base64URL 디코더 (JWT payload 파싱용, 검증 없이 클라이언트 디코드만)
    const b64urlDecode = (s: string) => {
        try {
            const pad = (s.length % 4 === 2) ? "==" : (s.length % 4 === 3) ? "=" : "";
            const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
            const decoded = globalThis.atob ? atob(b64) : Buffer.from(b64, "base64").toString("binary");
            // binary → utf8
            const bytes = Array.from(decoded, (c) => c.charCodeAt(0));
            return new TextDecoder().decode(new Uint8Array(bytes));
        } catch {
            return "";
        }
    };

    // 서버 응답(normalize): ① 순수 JWT 문자열 ② JSON(둘 다 대응)
    const normalizeLogin = (raw: any, headers?: any) => {
        let token: string | undefined;
        let uid: string | undefined;
        let name: string | undefined;
        let roleUpper: "OWNER" | "EMPLOYEE" | undefined;

        // ① 응답이 순수 토큰 문자열인 경우 (지금 네 로그 케이스)
        if (typeof raw === "string" && raw.split(".").length === 3) {
            token = raw.trim();

            // payload 디코드 후 sub/role 추출 (예: {"sub":"qq","role":["ALBA"],...})
            const payloadStr = b64urlDecode(token.split(".")[1] || "");
            try {
                const payload = JSON.parse(payloadStr || "{}");
                uid = String(payload?.sub ?? "");
                let r: any = payload?.role ?? payload?.roles ?? payload?.authorities;
                if (Array.isArray(r) && r.length > 0) r = r[0];
                if (typeof r === "string") {
                    const s = r.trim().toUpperCase();
                    if (["OWNER", "CEO", "ROLE_OWNER", "ROLE_CEO"].includes(s)) roleUpper = "OWNER";
                    if (["EMPLOYEE", "ALBA", "ROLE_EMPLOYEE", "ROLE_ALBA", "USER", "ROLE_USER"].includes(s)) roleUpper = "EMPLOYEE";
                }
            } catch {
                // payload 파싱 실패 시 uid/role은 undefined로 둠
            }
            return { token, uid, name, roleUpper };
        }

        // ② JSON 모양인 경우(두 가지 스키마 모두 시도)
        const data = raw ?? {};
        // a) { accessToken, member:{ userId,name,role("owner"|"employee") } }
        if (data?.accessToken && data?.member) {
            token = data.accessToken;
            uid = data.member?.userId;
            name = data.member?.name;
            const r = String(data.member?.role ?? "").toLowerCase();
            roleUpper = r === "owner" ? "OWNER" : r ? "EMPLOYEE" : undefined;
            return { token, uid, name, roleUpper };
        }
        // b) { success, userId, userName, userType("owner"|"employee"), accessToken? }
        if (typeof data?.success !== "undefined") {
            token = data?.accessToken;
            uid = data?.userId;
            name = data?.userName;
            const r = String(data?.userType ?? "").toLowerCase();
            roleUpper = r === "owner" ? "OWNER" : r ? "EMPLOYEE" : undefined;
            return { token, uid, name, roleUpper };
        }

        // 기타 구조는 실패로 간주
        return { token: undefined, uid: undefined, name: undefined, roleUpper: undefined };
    };

    const handleLogin = async () => {
        if (!userId || !password) {
            return Alert.alert("입력 오류", "아이디와 비밀번호를 입력해주세요.");
        }

        // ── 기존 임시 로그인 로직 보존 ──────────────────────────────
        if (userId === "eee" && password === "123") {
            Alert.alert("로그인 성공", "알바생 계정으로 로그인되었습니다.");
            dispatch(setUser({ userId: "eee", name: "이호섭", role: "EMPLOYEE" }));
            navigation.replace("EmployeeHome");
            return;
        } else if (userId === "ooo" && password === "123") {
            Alert.alert("로그인 성공", "사장님 계정으로 로그인되었습니다.");
            dispatch(setUser({ userId: "ooo", name: "이호섭", role: "OWNER" }));
            navigation.replace("OwnerHome");
            return;
        }
        // ──────────────────────────────────────────────────────────

        try {
            setLoading(true);

            // 백엔드가 토큰만 text/plain으로 줄 수 있으므로 responseType: 'text'
            const res = await api.post("/member/login", { userId, password }, { responseType: "text" });

            // res.data가 문자열(JWT)일 수도, JSON일 수도 있음 → normalize
            let raw: any = res?.data;
            // 혹시 서버가 JSON 문자열을 text로 주는 경우 대비
            if (typeof raw === "string" && raw.trim().startsWith("{")) {
                try { raw = JSON.parse(raw); } catch {}
            }

            const { token, uid, name, roleUpper } = normalizeLogin(raw, res?.headers);

            console.log("LOGIN_DEBUG_BASEURL =", api.defaults.baseURL);
            console.log("LOGIN_DEBUG_RAW =", typeof raw === "string" ? raw : JSON.stringify(raw));
            console.log("LOGIN_DEBUG_PICKED =", { token: !!token, uid, name, roleUpper });

            // uid 없으면 실패로 간주 (success=false 응답도 여기서 걸러짐)
            if (!uid) {
                Alert.alert("로그인 실패", "서버 응답을 해석할 수 없습니다. 잠시 후 다시 시도해주세요.");
                return;
            }

            // 토큰이 있으면 이후 요청 자동 인증
            if (token) {
                api.defaults.headers.common.Authorization = `Bearer ${token}`;
            }

            Alert.alert("로그인 성공", `${name ?? uid}님 환영합니다!`);

            // Redux 저장 — role이 없으면 안전 기본값 EMPLOYEE
            const finalRole = roleUpper ?? "EMPLOYEE";
            dispatch(setUser({ userId: uid, name: name ?? "", role: finalRole }));

            // 기존 네비 플로우 유지
            if (finalRole === "EMPLOYEE") {
                navigation.replace("EmployeeHome");
            } else if (finalRole === "OWNER") {
                navigation.replace("OwnerHome");
            } else {
                Alert.alert("알 수 없는 사용자 유형입니다.");
            }
        } catch (err: any) {
            console.error("LOGIN_ERR", err?.response?.status, err?.response?.data);
            const st = err?.response?.status;
            if (st === 401 || st === 403) {
                Alert.alert("로그인 실패", "아이디 또는 비밀번호가 올바르지 않습니다.");
            } else {
                Alert.alert("서버 오류", "로그인 요청 중 문제가 발생했습니다.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={s.container}>
            <Text style={s.title}>알바 매니저 앱</Text>

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

            <Pressable style={[s.loginButton, loading && { opacity: 0.5 }]} onPress={handleLogin}>
                <Text style={s.loginButtonText}>
                    {loading ? "로그인 중..." : "로그인"}
                </Text>
            </Pressable>

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
    linkRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
    linkText: { color: "#6c757d", fontSize: 14 },
});
