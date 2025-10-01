import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function OwnerHomeScreen() {
    return (
        <View style={s.container}>
            <Text style={s.title}>사장님 홈</Text>
            <Text style={s.text}>직원 관리, 스케줄 등록, 공지사항 작성 등을 할 수 있습니다.</Text>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
    text: { fontSize: 16, color: "#555" },
});
