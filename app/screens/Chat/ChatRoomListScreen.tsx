// app/screens/Chat/ChatRoomListScreen.tsx
import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { useNavigation } from "@react-navigation/native";
import { useNoticeTopic } from "@/app/utils/useNoticeTopic";

type RoomItem = {
    id: number | string;
    name: string;
    type: "workplace";
};

export default function ChatRoomListScreen() {
    const nav = useNavigation<any>();
    const user = useSelector((s: RootState) => s.user);
    const workplaceId = user.workplaceId ?? 0;
    const workplaceName = user.workplaceName ?? "매장";

    // ✅ 공지 구독(배너만 사용, 리스트 항목에는 공지 채널 제거)
    const { notices } = useNoticeTopic(workplaceId, user.accessToken || undefined);
    const latest = notices?.[0];

    // ✅ 리스트에는 오직 "매장 단체방"만 노출
    const rooms: RoomItem[] = useMemo(
        () => [
            {
                id: workplaceId,
                name: `${workplaceName} 단체방`,
                type: "workplace",
            },
        ],
        [workplaceId, workplaceName]
    );

    return (
        <SafeAreaView style={s.container}>
            <View style={s.header}>
                <Text style={s.title}>채팅</Text>
            </View>

            {/* 최근 공지 배너 (요청 없으므로 유지) */}
            <View style={s.noticeCard}>
                <Ionicons name="megaphone-outline" size={18} color="#111" />
                <View style={{ flex: 1 }}>
                    <Text style={s.noticeTitle}>{latest?.title || "최근 공지"}</Text>
                    <Text style={s.noticeContent} numberOfLines={1}>
                        {latest?.content || "공지 채널에서 공지를 확인하세요."}
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={() => nav.navigate("ChatRoom", { roomId: workplaceId, mode: "notice" as const })}
                    style={s.noticeBtn}
                >
                    <Text style={s.noticeBtnText}>보기</Text>
                </TouchableOpacity>
            </View>

            {/* 채팅방 리스트 (단일 항목) */}
            <FlatList
                data={rooms}
                keyExtractor={(it) => String(it.id)}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={s.roomItem}
                        onPress={() =>
                            nav.navigate("ChatRoom", {
                                roomId: workplaceId,
                                mode: "chat" as const, // ✅ 항상 채팅 모드
                            })
                        }
                    >
                        <View style={s.roomIcon}>
                            <Ionicons name="chatbubble-ellipses-outline" size={18} color="#111" />
                        </View>
                        <Text style={s.roomName}>{item.name}</Text>
                        <Ionicons name="chevron-forward" size={18} color="#999" />
                    </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => <View style={{ height: 4 }} />}
                ListFooterComponent={<View style={{ height: 16 }} />}
            />
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f7f7f7" },
    header: {
        height: 48,
        justifyContent: "center",
        paddingHorizontal: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#eee",
        backgroundColor: "#fff",
    },
    title: { fontSize: 18, fontWeight: "700", color: "#111" },

    // 공지 배너
    noticeCard: {
        margin: 16,
        padding: 12,
        borderRadius: 12,
        backgroundColor: "#fff",
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: "#eaeaea",
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    noticeTitle: { fontSize: 12, color: "#555" },
    noticeContent: { fontSize: 14, color: "#111", marginTop: 2 },
    noticeBtn: { backgroundColor: "#007AFF", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
    noticeBtnText: { color: "#fff", fontWeight: "600" },

    // 채팅방 아이템
    roomItem: {
        marginHorizontal: 16,
        marginVertical: 8,
        padding: 14,
        borderRadius: 12,
        backgroundColor: "#fff",
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: "#eee",
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    roomIcon: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "#f1f1f1",
        alignItems: "center",
        justifyContent: "center",
    },
    roomName: { flex: 1, fontSize: 15, fontWeight: "600" },
});
