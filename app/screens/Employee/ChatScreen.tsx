import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ChatScreen({ navigation }: any) {
    return (
        <View style={s.container}>
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={28} color="#111" />
                </TouchableOpacity>
                <Text style={s.title}>💬 채팅</Text>
                <View style={{ width: 28 }} />
            </View>

            <View style={s.content}>
                <Text style={s.text}>대화 목록 및 메시지가 여기에 표시됩니다.</Text>
            </View>
        </View>
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
