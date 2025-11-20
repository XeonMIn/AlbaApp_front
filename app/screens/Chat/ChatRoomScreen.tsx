// app/screens/Chat/ChatRoomScreen.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet,
    KeyboardAvoidingView, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useStompRoom } from "@/app/utils/useStompRoom";
import api from "@/api/axios";

type ParamList = {
    ChatRoom: { roomId: number | string; mode: "chat" | "notice" };
};

type ChatMsgUI = {
    roomId?: string | number;
    sender?: string;
    content?: string;
    sentAt?: number;      // epoch millis
    _localId?: string;    // 낙관적 메시지면 존재
};

const fmtClock = (ms: number) =>
    new Intl.DateTimeFormat("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    }).format(ms);

export default function ChatRoomScreen() {
    const { params } = useRoute<RouteProp<ParamList, "ChatRoom">>();
    const user = useSelector((s: RootState) => s.user);

    const roomId = useMemo(
        () => params?.roomId ?? user.workplaceId ?? 1,
        [params?.roomId, user.workplaceId]
    );
    const mode = params?.mode || "chat";
    const sender = useMemo(
        () => user.name || user.userId || "anonymous",
        [user.name, user.userId]
    );

    const { connected, messages, loadingHistory, sendMessage } = useStompRoom({
        roomId,
        sender,
        token: user.accessToken,
    });

    const [text, setText] = useState("");

    /** ---------- 윈도우(호스트) 시계 동기화 ---------- */
        // serverOffset = (백엔드 시각[=윈도우] - 현재 JS 시각)
    const [serverOffset, setServerOffset] = useState(0);
    const [hostNow, setHostNow] = useState(() => Date.now());

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                // 백엔드가 윈도우에서 돌기 때문에 이 헤더가 곧 네 PC 시계야.
                const res = await api.get("/member/me");
                const hdr = (res.headers?.date ||
                    res.headers?.Date ||
                    res.headers?.DATE) as string | undefined;
                const serverMs = hdr ? Date.parse(hdr) : Date.now();
                if (!alive) return;
                setServerOffset(serverMs - Date.now());
            } catch {
                if (!alive) return;
                setServerOffset(0); // 실패 시 로컬(에뮬레이터)로 fallback
            }
        })();
        return () => { alive = false; };
    }, [user.accessToken]);

    // 1초마다 윈도우 시각 갱신
    useEffect(() => {
        const id = setInterval(() => setHostNow(Date.now() + serverOffset), 1000);
        return () => clearInterval(id);
    }, [serverOffset]);

    /** ---------- 자동 스크롤 ---------- */
    const listRef = useRef<FlatList<ChatMsgUI>>(null);
    useEffect(() => {
        const t = setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 40);
        return () => clearTimeout(t);
    }, [messages.length]);

    const onSend = () => {
        if (mode === "notice") return;
        const t = text.trim();
        if (!t) return;
        sendMessage(t);
        setText("");
    };

    return (
        <SafeAreaView style={s.container}>
            {/* 상단 헤더 */}
            <View style={s.header}>
                <View>
                    <Text style={s.title}>
                        {mode === "notice" ? `공지 채널 #${roomId}` : `채팅방 #${roomId}`}
                    </Text>
                    {/* 윈도우(호스트) 현재 시각 */}
                    <Text style={s.nowClock}>현재시각 {fmtClock(hostNow)} (호스트 기준)</Text>
                </View>
                <View style={s.statusWrap}>
                    <View style={[s.dot, { backgroundColor: connected ? "#34C759" : "#FF3B30" }]} />
                    <Text style={s.status}>
                        {loadingHistory ? "기록 불러오는 중..." : connected ? "실시간 연결됨" : "연결 끊김"}
                    </Text>
                </View>
            </View>

            {/* 메시지 목록 */}
            <FlatList
                ref={listRef}
                data={messages as unknown as ChatMsgUI[]}
                keyExtractor={(item, idx) =>
                    item._localId ?? `${item.roomId}-${item.sender}-${item.sentAt}-${idx}`
                }
                renderItem={({ item }) => {
                    const mine =
                        (item.sender ?? "").trim().toLowerCase() === sender.trim().toLowerCase();

                    // ⏰ 표시 시간: 서버가 찍어준 sentAt(=윈도우) 그대로.
                    // 낙관적 메시지는 sentAt + serverOffset 으로 '윈도우 시계'에 보정.
                    const base = typeof item.sentAt === "number" ? item.sentAt : Date.now();
                    const shownMs = item._localId ? base + serverOffset : base;
                    const timeLabel = fmtClock(shownMs);

                    return (
                        <View
                            style={[
                                s.msgRow,
                                mine ? { justifyContent: "flex-end" } : { justifyContent: "flex-start" },
                            ]}
                        >
                            {!mine && (
                                <View style={s.peerBadge}>
                                    <Text style={s.peerBadgeText}>
                                        {item.sender?.slice(0, 2) || "상대"}
                                    </Text>
                                </View>
                            )}
                            <View style={[s.bubble, mine ? s.my : s.other]}>
                                {!mine && <Text style={s.sender}>{item.sender}</Text>}
                                <Text style={s.content}>{item.content}</Text>
                                <Text style={[s.time, mine ? s.timeMe : s.timeOther]}>{timeLabel}</Text>
                            </View>
                        </View>
                    );
                }}
                contentContainerStyle={{ padding: 12, paddingBottom: 90 }}
                onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
                initialNumToRender={20}
                windowSize={10}
                removeClippedSubviews
            />

            {/* 입력창 */}
            <KeyboardAvoidingView behavior={Platform.select({ ios: "padding", android: undefined })}>
                <View style={s.inputRow}>
                    <TextInput
                        style={[s.input, mode === "notice" && { backgroundColor: "#eee" }]}
                        placeholder={
                            mode === "notice"
                                ? "공지 채널은 읽기 전용입니다"
                                : connected
                                    ? "메시지를 입력하세요"
                                    : "연결 중..."
                        }
                        value={text}
                        onChangeText={setText}
                        editable={connected && mode !== "notice"}
                        onSubmitEditing={onSend}
                        returnKeyType="send"
                    />
                    <TouchableOpacity
                        style={[
                            s.sendBtn,
                            (mode === "notice" || !connected || !text.trim()) && { opacity: 0.5 },
                        ]}
                        onPress={onSend}
                        disabled={mode === "notice" || !connected || !text.trim()}
                    >
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
        paddingHorizontal: 16, paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#e8e8e8",
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    },
    title: { fontSize: 18, fontWeight: "700" },
    nowClock: { marginTop: 4, fontSize: 12, color: "#8a8a8a" },

    statusWrap: { flexDirection: "row", alignItems: "center", gap: 6 },
    dot: { width: 8, height: 8, borderRadius: 4 },
    status: { fontSize: 12, color: "#666" },

    msgRow: { flexDirection: "row", alignItems: "flex-end", marginVertical: 6, paddingHorizontal: 8 },
    peerBadge: {
        width: 28, height: 28, borderRadius: 14, backgroundColor: "#EFEFEF",
        alignItems: "center", justifyContent: "center", marginRight: 8,
    },
    peerBadgeText: { fontSize: 11, color: "#666" },

    bubble: { maxWidth: "78%", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14 },
    my: { backgroundColor: "#007AFF", borderBottomRightRadius: 2 },
    other: { backgroundColor: "#F2F2F7", borderBottomLeftRadius: 2 },

    sender: { fontSize: 11, color: "#555", marginBottom: 2 },
    content: { fontSize: 15, color: "#000" },

    time: { marginTop: 4, fontSize: 11 },
    timeOther: { color: "#888", alignSelf: "flex-start" },
    timeMe: { color: "#DCE9FF", alignSelf: "flex-end" },

    inputRow: {
        flexDirection: "row", alignItems: "center",
        paddingHorizontal: 12, paddingVertical: 10,
        borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#e8e8e8",
        backgroundColor: "#fff",
    },
    input: {
        flex: 1, backgroundColor: "#f7f7f7",
        borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, marginRight: 8,
    },
    sendBtn: { backgroundColor: "#007AFF", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20 },
});
