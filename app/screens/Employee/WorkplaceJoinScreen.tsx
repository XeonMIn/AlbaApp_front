import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    Pressable,
    StyleSheet,
    Alert,
    TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { joinWorkplace } from "@/api/employment.api"; // ⭐ 추가

export default function WorkplaceJoinScreen({ navigation }: any) {
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false); // ⭐ 로딩 상태

    const handleBack = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            // 스택이 없을 때를 대비한 fallback
            navigation.navigate("Login");
        }
    };

    const submit = async () => {
        const trimmed = code.trim();
        if (!trimmed) {
            return Alert.alert("입력 오류", "매장 코드를 입력하세요.");
        }

        try {
            setLoading(true);

            // ⭐ 실제 백엔드 호출
            const res = await joinWorkplace(trimmed);
            // res: { success: true, workplaceId, workplaceName }

            Alert.alert(
                "매장 등록 완료",
                `${res.workplaceName} 매장에 연결되었어요.`,
                [
                    {
                        text: "확인",
                        onPress: () =>
                            navigation.reset({
                                index: 0,
                                routes: [{ name: "EmployeeTabs" }],
                            }),
                    },
                ]
            );
        } catch (error: any) {
            console.log("joinWorkplace error:", error);

            const msg =
                error?.response?.data?.message ??
                error?.message ??
                "매장 등록 중 오류가 발생했습니다.\n코드를 다시 확인해주세요.";

            Alert.alert("등록 실패", msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={s.container}>
            {/* 상단 헤더 */}
            <View style={s.header}>
                <TouchableOpacity onPress={handleBack}>
                    <Ionicons name="chevron-back" size={26} color="#111" />
                </TouchableOpacity>
                <Text style={s.title}>매장 등록 요청</Text>
                {/* 오른쪽 정렬용 더미 */}
                <View style={{ width: 26 }} />
            </View>

            {/* 본문 */}
            <View style={s.content}>
                <Text style={s.label}>매장 코드를 입력하세요</Text>
                <TextInput
                    style={s.input}
                    placeholder="ex) ABC12345"
                    value={code}
                    onChangeText={(v) => setCode(v.replace(/\s+/g, "").toUpperCase())} // 공백 제거 + 대문자
                    keyboardType="default"     // ✅ 기본 키보드(문자+숫자)
                    inputMode="text"           // ✅ Android 텍스트 키보드 유도
                    autoCapitalize="characters"
                    autoCorrect={false}
                    maxLength={12}             // 필요시 조정
                    returnKeyType="done"
                    onSubmitEditing={submit}
                />
                <Pressable
                    style={[s.submit, (loading || !code.trim()) && { opacity: 0.6 }]}
                    onPress={submit}
                    disabled={loading || !code.trim()}
                >
                    <Text style={s.submitText}>
                        {loading ? "등록 중..." : "등록"}
                    </Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        backgroundColor: "#fff",
        elevation: 2,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#111",
    },
    content: {
        flex: 1,
        backgroundColor: "#fff",
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    label: {
        fontSize: 14,
        color: "#111",
        marginBottom: 12,
    },
    input: {
        height: 48,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#e6e9ef",
        backgroundColor: "#f7f9fc",
        paddingHorizontal: 14,
        marginBottom: 16,
    },
    submit: {
        width: 96,
        height: 40,
        borderRadius: 8,
        backgroundColor: "#111",
        alignItems: "center",
        justifyContent: "center",
    },
    submitText: {
        color: "#fff",
        fontSize: 15,
    },
});
