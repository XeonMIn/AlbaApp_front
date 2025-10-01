import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileScreen({ navigation }: any) {
    return (
        <View style={s.container}>
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={28} color="#111" />
                </TouchableOpacity>
                <Text style={s.title}>👤 내 정보</Text>
                <View style={{ width: 28 }} />
            </View>

            <View style={s.content}>
                <Image
                    source={{ uri: "https://cdn-icons-png.flaticon.com/512/847/847969.png" }}
                    style={s.profileImage}
                />
                <Text style={s.name}>강선민</Text>
                <Text style={s.subText}>알바생 · 스마트커피</Text>
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
    profileImage: { width: 100, height: 100, borderRadius: 50, marginBottom: 12 },
    name: { fontSize: 22, fontWeight: "bold" },
    subText: { color: "#777", marginTop: 4 },
});
