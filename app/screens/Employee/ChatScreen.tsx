// app/screens/Employee/ChatScreen.tsx
import React, { useMemo, useState } from "react";
import {
    View,
    Text,
    TextInput,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { useStompRoom } from "@/app/utils/useStompRoom";

export default function ChatScreen() {
    const user = useSelector((s: RootState) => s.user);

    // 방 규칙: 우선순위로 현재 선택된 workplaceId 사용. 없으면 1번 방으로.
    const roomId = useMemo(() => user.workplaceId ?? 1, [user.workplaceId]);
    const sender = useMemo(() => user.name || user.userId || "anonymous", [user.name, user.userId]);

    const { connected, messages, sendMessage } = useStompRoom({
        roomId,
        sender,
        token: user.accessToken,
    });

    const [text, setText] = useState("");

    const onSend = () => {
        const v = text.trim();
        if (!v) return;
        sendMessage(v);
        setText("");
    };

    return (
        <SafeAreaView style={s.container}>
            {/* 상단 헤더 */}
            <View style={s.header}>
                <Text style={s.title}>채팅방 #{roomId}</Text>
                <View style={s.statusWrap}>
                    <View style={[s.dot, { backgroundColor: connected ? "#34C759" : "#FF3B30" }]} />
                    <Text style={s.status}>{connected ? "실시간 연결됨" : "연결 안 됨"}</Text>
                </View>
            </View>

            {/* 메시지 목록 */}
            <FlatList
                data={messages}
                keyExtractor={(item, idx) => item.localId ?? `${item.roomId}-${idx}`}
                renderItem={({ item }) => {
                    const mine = item.sender === sender;
                    return (
                        <View style={[s.msgRow, mine ? { justifyContent: "flex-end" } : { justifyContent: "flex-start" }]}>
                            {!mine && <View style={s.peerBadge}><Text style={s.peerBadgeText}>{item.sender?.slice(0, 2)}</Text></View>}
                            <View style={[s.bubble, mine ? s.my : s.other]}>
                                {!mine && <Text style={s.sender}>{item.sender}</Text>}
                                <Text style={s.content}>{item.content}</Text>
                            </View>
                        </View>
                    );
                }}
                contentContainerStyle={{ padding: 12 }}
                inverted={false}
            />

            {/* 입력창 */}
            <KeyboardAvoidingView behavior={Platform.select({ ios: "padding", android: undefined })}>
                <View style={s.inputRow}>
                    <TextInput
                        style={s.input}
                        placeholder={connected ? "메시지를 입력하세요" : "연결 중..."}
                        value={text}
                        onChangeText={setText}
                        editable={connected}
                        onSubmitEditing={onSend}
                        returnKeyType="send"
                    />
                    <TouchableOpacity style={s.sendBtn} onPress={onSend} disabled={!connected || !text.trim()}>
                        <Ionicons name="send" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#e8e8e8",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    title: { fontSize: 18, fontWeight: "700" },
    statusWrap: { flexDirection: "row", alignItems: "center", gap: 6 },
    dot: { width: 8, height: 8, borderRadius: 4 },
    status: { fontSize: 12, color: "#666" },

    msgRow: { flexDirection: "row", alignItems: "flex-end", marginVertical: 6, paddingHorizontal: 8 },
    peerBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "#EFEFEF",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 8,
    },
    peerBadgeText: { fontSize: 11, color: "#666" },

    bubble: { maxWidth: "78%", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14 },
    my: { backgroundColor: "#007AFF", borderBottomRightRadius: 2 },
    other: { backgroundColor: "#F2F2F7", borderBottomLeftRadius: 2 },

    sender: { fontSize: 11, color: "#555", marginBottom: 2 },
    content: { fontSize: 15, color: "#000" },

    inputRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: "#e8e8e8",
        backgroundColor: "#fff",
    },
    input: {
        flex: 1,
        backgroundColor: "#f7f7f7",
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 10,
        marginRight: 8,
    },
    sendBtn: {
        backgroundColor: "#007AFF",
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 20,
    },
});
