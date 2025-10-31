import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context"; // ✅ 추가

export default function OwnerChatScreen({ navigation }: any) {
    return (
        <SafeAreaView style={s.container}>
            {/* 상단 헤더 */}
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={26} color="#111" />
                </TouchableOpacity>
                <Text style={s.title}>채팅</Text>
                <TouchableOpacity onPress={() => alert("새 채팅 기능 준비중입니다.")}>
                    <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
                </TouchableOpacity>
            </View>

            {/* 본문 영역 */}
            <View style={s.content}>
                <Text style={s.text}>직원과의 채팅 목록이 여기에 표시됩니다.</Text>
            </View>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },

    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        backgroundColor: "#fff",
        elevation: 3,
    },
    title: { fontSize: 20, fontWeight: "bold", color: "#111" },

    content: { flex: 1, justifyContent: "center", alignItems: "center" },
    text: { fontSize: 16, color: "#555" },
});
