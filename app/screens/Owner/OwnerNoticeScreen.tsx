// app/screens/Owner/OwnerNoticeScreen.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    Modal, TextInput, Alert, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import {
    AnnouncementDto,
    fetchAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
} from "@/api/announcement.api";
import { useNoticeTopic } from "@/app/utils/useNoticeTopic";
import { publish, connectStomp } from "@/app/utils/stompClient";

function parseDate(s?: string) { if (!s) return 0; return new Date(s.replace(" ", "T")).getTime() || 0; }
function nowStr(): string {
    const d = new Date(); const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export default function OwnerNoticeScreen() {
    const user = useSelector((s: RootState) => s.user);
    const workplaceId: number | undefined = user.workplaceId ?? undefined;
    const token: string | undefined = user.accessToken ?? undefined;

    const [loading, setLoading] = useState(true);
    const [history, setHistory] = useState<AnnouncementDto[]>([]);
    const { notices } = useNoticeTopic(workplaceId, token);

    const [visible, setVisible] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    useEffect(() => {
        let cancelled = false;
        (async () => {
            if (!workplaceId) { setLoading(false); return; }
            setLoading(true);
            try {
                const data = await fetchAnnouncements(workplaceId);
                if (!cancelled) setHistory(data);
            } catch (e) {
                console.warn("[OWNER NOTICE] history fetch error:", e);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [workplaceId]);

    const merged = useMemo(() => {
        const map = new Map<number | string, AnnouncementDto>();
        const k = (n: AnnouncementDto, i: number) => n.id ?? `${n.title}__${n.content}__${n.createdtime ?? ""}__${i}`;
        [...history, ...notices].forEach((n, i) => map.set(k(n, i), n));
        return Array.from(map.values()).sort((a, b) => parseDate(b.createdtime) - parseDate(a.createdtime));
    }, [notices, history]);

    const openCreate = () => { setEditId(null); setTitle(""); setContent(""); setVisible(true); };
    const openEdit = (n: AnnouncementDto) => { setEditId(n.id ?? null); setTitle(n.title ?? ""); setContent(n.content ?? ""); setVisible(true); };

    const handleSubmit = async () => {
        if (!title.trim() || !content.trim()) return Alert.alert("입력 오류", "제목과 내용을 모두 입력하세요.");
        if (!workplaceId) return Alert.alert("오류", "현재 선택된 매장이 없습니다.");

        if (editId == null) {
            try {
                await connectStomp(token);
                await publish(`/pub/notice.new.${workplaceId}`, { title, content, workplaceId },
                    token ? { Authorization: `Bearer ${token}` } : undefined);
                setVisible(false); setTitle(""); setContent("");
            } catch (e) {
                try {
                    await createAnnouncement({ title, content, workplaceId });
                    setVisible(false); setTitle(""); setContent("");
                } catch (err) {
                    console.error(err); Alert.alert("오류", "공지 등록에 실패했습니다.");
                }
            }
            return;
        }

        try {
            const payload: AnnouncementDto = { id: editId, title, content, workplaceId };
            await updateAnnouncement(editId, payload);
            const optimisticTime = nowStr();
            setHistory(prev => prev.map(n => n.id === editId ? { ...n, title, content, createdtime: optimisticTime } : n));
            setVisible(false); setEditId(null); setTitle(""); setContent("");
        } catch (err) {
            console.error(err); Alert.alert("오류", "공지 수정에 실패했습니다.");
        }
    };

    const handleDelete = async (id?: number) => {
        if (!id) return;
        Alert.alert("삭제 확인", "이 공지를 삭제할까요?", [
            { text: "취소", style: "cancel" },
            { text: "삭제", style: "destructive", onPress: async () => {
                    try { await deleteAnnouncement(id); setHistory(prev => prev.filter(n => n.id !== id)); }
                    catch (err) { console.error(err); Alert.alert("오류", "공지 삭제에 실패했습니다."); }
                }}
        ]);
    };

    return (
        <SafeAreaView style={s.container} edges={["top", "left", "right"]}>
            {/* 뒤로가기 제거, 제목 가운데, 우측에 플러스만 */}
            <View style={s.header}>
                <View style={{ width: 26 }} />
                <Text style={s.title}>공지 관리</Text>
                <TouchableOpacity onPress={openCreate}>
                    <Ionicons name="add-circle-outline" size={26} color="#111" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                    <ActivityIndicator />
                </View>
            ) : (
                <ScrollView contentContainerStyle={{ padding: 16 }}>
                    {merged.length === 0 && (
                        <Text style={{ textAlign: "center", color: "#666" }}>등록된 공지가 없습니다.</Text>
                    )}
                    {merged.map((n, idx) => (
                        <View key={n.id ?? idx} style={s.noticeCard}>
                            <View style={s.cardHeader}>
                                <Text style={s.noticeTitle} numberOfLines={1}>{n.title}</Text>
                                <Text style={s.dateText}>{n.createdtime?.slice(0, 16)}</Text>
                            </View>
                            <Text style={s.noticeContent}>{n.content}</Text>

                            <View style={s.actions}>
                                <TouchableOpacity style={s.actionBtn} onPress={() => openEdit(n)}>
                                    <Ionicons name="create-outline" size={18} />
                                    <Text style={s.actionText}>수정</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={s.actionBtn} onPress={() => handleDelete(n.id)}>
                                    <Ionicons name="trash-outline" size={18} />
                                    <Text style={s.actionText}>삭제</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </ScrollView>
            )}

            {/* 작성/수정 모달 */}
            <Modal visible={visible} animationType="slide" transparent onRequestClose={() => setVisible(false)}>
                <View style={s.modalBackdrop}>
                    <View style={s.modalBox}>
                        <Text style={s.modalTitle}>{editId == null ? "공지 작성" : "공지 수정"}</Text>
                        <TextInput value={title} onChangeText={setTitle} placeholder="제목" style={s.input} />
                        <TextInput value={content} onChangeText={setContent} placeholder="내용" style={[s.input, { height: 120 }]} multiline />
                        <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 12 }}>
                            <TouchableOpacity onPress={() => setVisible(false)}><Text style={s.cancel}>취소</Text></TouchableOpacity>
                            <TouchableOpacity onPress={handleSubmit}><Text style={s.submit}>{editId == null ? "등록" : "저장"}</Text></TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    header: {
        height: 56, paddingHorizontal: 16,
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#ddd",
    },
    title: { fontSize: 18, fontWeight: "700", color: "#111", textAlign: "center" },

    noticeCard: {
        backgroundColor: "#fafafa", borderRadius: 12, padding: 14,
        borderWidth: StyleSheet.hairlineWidth, borderColor: "#e3e3e3", marginBottom: 12,
    },
    cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
    noticeTitle: { fontSize: 16, fontWeight: "700", color: "#111", flex: 1, marginRight: 8 },
    dateText: { fontSize: 12, color: "#888" },
    noticeContent: { fontSize: 14, color: "#333", lineHeight: 20 },

    actions: { flexDirection: "row", gap: 12, marginTop: 10 },
    actionBtn: {
        flexDirection: "row", alignItems: "center", gap: 4,
        paddingVertical: 6, paddingHorizontal: 10,
        borderRadius: 8, borderWidth: StyleSheet.hairlineWidth, borderColor: "#ddd",
    },
    actionText: { fontSize: 13, color: "#111" },

    modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", justifyContent: "center" },
    modalBox: { width: "88%", backgroundColor: "#fff", borderRadius: 16, padding: 16 },
    modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
    input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 12, marginBottom: 12, fontSize: 15, backgroundColor: "#fff" },
    cancel: { fontSize: 16, color: "#777", paddingHorizontal: 8, paddingVertical: 6 },
    submit: { fontSize: 16, color: "#111", fontWeight: "700", paddingHorizontal: 8, paddingVertical: 6 },
});
