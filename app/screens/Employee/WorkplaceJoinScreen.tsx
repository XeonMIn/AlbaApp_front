import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";

export default function WorkplaceJoinScreen({ navigation }: any) {
    const [code, setCode] = useState("");

    const submit = () => {
        const trimmed = code.trim();
        if (!trimmed) return Alert.alert("입력 오류", "매장 코드를 입력하세요.");

        // ✅ 백엔드 없이 즉시 성공 처리 → 직원 홈으로 이동
        Alert.alert("완료", "매장 등록이 완료되었어요.", [
            { text: "확인", onPress: () => navigation.reset({ index: 0, routes: [{ name: "EmployeeHome" }] }) },
        ]);
    };

    return (
        <View style={s.container}>
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
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 20, paddingTop: 24 },
    label: { fontSize: 14, color: "#111", marginBottom: 12 },
    input: {
        height: 48, borderRadius: 10, borderWidth: 1, borderColor: "#e6e9ef",
        backgroundColor: "#f7f9fc", paddingHorizontal: 14, marginBottom: 16
    },
    submit: { width: 96, height: 40, borderRadius: 8, backgroundColor: "#111", alignItems: "center", justifyContent: "center" },
    submitText: { color: "#fff", fontSize: 15 },
});
