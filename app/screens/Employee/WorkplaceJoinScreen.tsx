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

export default function WorkplaceJoinScreen({ navigation }: any) {
    const [code, setCode] = useState("");

    const handleBack = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            // 스택이 없을 때를 대비한 fallback
            navigation.navigate("EmployeeNoWorkplace");
        }
    };

    const submit = () => {
        const trimmed = code.trim();
        if (!trimmed) {
            return Alert.alert("입력 오류", "매장 코드를 입력하세요.");
        }

        // ✅ 백엔드 없이 즉시 성공 처리 → 직원 홈으로 이동
        Alert.alert("완료", "매장 등록이 완료되었어요.", [
            {
                text: "확인",
                onPress: () =>
                    navigation.reset({
                        index: 0,
                        routes: [{ name: "EmployeeTabs" }],
                    }),
            },
        ]);
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
                    placeholder="ex)1234567"
                    value={code}
                    onChangeText={setCode}
                    keyboardType="number-pad"
                    returnKeyType="done"
                    onSubmitEditing={submit}
                />
                <Pressable style={s.submit} onPress={submit}>
                    <Text style={s.submitText}>등록</Text>
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
