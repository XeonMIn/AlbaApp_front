// app/screens/Chat/ChatRoomListScreen.tsx
import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { useNavigation } from "@react-navigation/native";

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

    // 🟦 단체방만 노출
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

            {/* 🟦 공지 패널 완전 제거 */}

            <FlatList
                data={rooms}
                keyExtractor={(it) => String(it.id)}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={s.roomItem}
                        onPress={() =>
                            nav.navigate("ChatRoom", {
                                roomId: workplaceId,
                                mode: "chat", // 항상 채팅 모드
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

    // 단체방 리스트
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
