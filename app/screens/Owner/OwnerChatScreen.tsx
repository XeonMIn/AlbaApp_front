import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function OwnerChatScreen({ navigation }: any) {
    return (
        <View style={s.container}>
            <View style={s.header}>
                <Text style={s.title}>채팅</Text>
                <TouchableOpacity onPress={() => alert("새 채팅 기능 준비중입니다.")}>
                    <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
                </TouchableOpacity>
            </View>

            <View style={s.content}>
                <Text style={s.text}>직원과의 채팅 목록이 여기에 표시됩니다.</Text>
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
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        backgroundColor: "#fff",
    },
    title: { fontSize: 20, fontWeight: "bold", color: "#111" },
    content: { flex: 1, justifyContent: "center", alignItems: "center" },
    text: { fontSize: 16, color: "#555" },
});
