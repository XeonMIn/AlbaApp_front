import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NoticeScreen({ navigation }: any) {
    const notices = [
        {
            id: 1,
            title: "이번 주 주말 휴무 안내",
            content: "10월 19~20일은 매장 리모델링으로 휴무입니다.",
            date: "2025-10-15",
            important: true,
        },
        {
            id: 2,
            title: "유니폼 변경 안내",
            content: "11월부터 새로운 유니폼 착용 예정입니다. 사이즈 신청 부탁드립니다.",
            date: "2025-10-10",
            important: false,
        },
    ];

    return (
        <SafeAreaView style={s.container}>
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={26} color="#111" />
                </TouchableOpacity>
                <Text style={s.title}>공지사항</Text>
                <View style={{ width: 26 }} />
            </View>

            <ScrollView contentContainerStyle={{ padding: 16 }}>
                {notices.map((notice) => (
                    <TouchableOpacity key={notice.id} style={s.noticeCard}>
                        <View style={s.cardHeader}>
                            {notice.important && (
                                <Ionicons name="alert-circle" size={18} color="red" style={{ marginRight: 6 }} />
                            )}
                            <Text style={s.noticeTitle}>{notice.title}</Text>
                        </View>
                        <Text style={s.noticeContent}>{notice.content}</Text>
                        <Text style={s.noticeDate}>{notice.date}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
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
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        backgroundColor: "#fff",
        elevation: 2,
    },
    title: { fontSize: 20, fontWeight: "bold", color: "#111" },
    noticeCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
    },
    noticeTitle: { fontSize: 16, fontWeight: "bold", color: "#111" },
    noticeContent: { fontSize: 14, color: "#555", marginBottom: 8 },
    noticeDate: { fontSize: 12, color: "#888", textAlign: "right" },
});
