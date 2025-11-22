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

function parseDate(s?: string) {
    if (!s) return 0;
    return new Date(s.replace(" ", "T")).getTime() || 0;
}

/** 서버 포맷(yyyy-MM-dd HH:mm:ss)으로 현재시각 문자열 만들기 */
function nowStr(): string {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export default function OwnerNoticeScreen({ navigation }: any) {
    const user = useSelector((s: RootState) => s.user);
    const workplaceId: number | undefined = user.workplaceId ?? undefined;
    const token: string | undefined = user.accessToken ?? undefined;

    const [loading, setLoading] = useState(true);
    const [history, setHistory] = useState<AnnouncementDto[]>([]);
    const { notices } = useNoticeTopic(workplaceId, token);

    // 작성/수정 모달 상태
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

    /**
     * 🔑 포인트: 합칠 때 순서를 [history, notices]로 변경
     *  - 수정 직후엔 history를 낙관적으로 즉시 반영
     *  - 잠시 후 서버에서 오는 updated 이벤트(notices)가 **덮어씌움(최종 권위)**
     */
    const merged = useMemo(() => {
        const map = new Map<number | string, AnnouncementDto>();
        const k = (n: AnnouncementDto, i: number) => n.id ?? `${n.title}__${n.content}__${n.createdtime ?? ""}__${i}`;
        [...history, ...notices].forEach((n, i) => map.set(k(n, i), n)); // ← 순서 바꿈
        return Array.from(map.values()).sort((a, b) => parseDate(b.createdtime) - parseDate(a.createdtime));
    }, [notices, history]);

    const openCreate = () => {
        setEditId(null);
        setTitle("");
        setContent("");
        setVisible(true);
    };

    const openEdit = (n: AnnouncementDto) => {
        setEditId(n.id ?? null);
        setTitle(n.title ?? "");
        setContent(n.content ?? "");
        setVisible(true);
    };

    const handleSubmit = async () => {
        if (!title.trim() || !content.trim()) {
            return Alert.alert("입력 오류", "제목과 내용을 모두 입력하세요.");
        }
        if (!workplaceId) {
            return Alert.alert("오류", "현재 선택된 매장이 없습니다.");
        }

        // 새로 작성
        if (editId == null) {
            try {
                await connectStomp(token);
                await publish(
                    `/pub/notice.new.${workplaceId}`,
                    { title, content, workplaceId },
                    token ? { Authorization: `Bearer ${token}` } : undefined
                );
                setVisible(false);
                setTitle(""); setContent("");
            } catch (e) {
                console.warn("[OWNER NOTICE] STOMP create 실패, REST 폴백:", e);
                try {
                    await createAnnouncement({ title, content, workplaceId });
                    setVisible(false);
                    setTitle(""); setContent("");
                } catch (err) {
                    console.error(err);
                    Alert.alert("오류", "공지 등록에 실패했습니다.");
                }
            }
            return;
        }

        // 수정: 1) 서버에 저장 요청
        try {
            const payload: AnnouncementDto = {
                id: editId,
                title, content,
                workplaceId,
            };
            await updateAnnouncement(editId, payload);

            // 2) ✅ 낙관적 업데이트: 즉시 현재시각으로 로컬 history 반영 (바로 화면 갱신)
            const optimisticTime = nowStr();
            setHistory(prev =>
                prev
                    .map(n => n.id === editId ? { ...n, title, content, createdtime: optimisticTime } : n)
            );

            // 3) 모달 종료
            setVisible(false);
            setEditId(null);
            setTitle(""); setContent("");

            // 4) 잠시 후 STOMP 'updated' 이벤트가 도착하면
            //    merged 에서 notices가 history를 **덮어씌워** 서버 시각으로 확정됨
        } catch (err) {
            console.error(err);
            Alert.alert("오류", "공지 수정에 실패했습니다.");
        }
    };

    const handleDelete = async (id?: number) => {
        if (!id) return;
        Alert.alert("삭제 확인", "이 공지를 삭제할까요?", [
            { text: "취소", style: "cancel" },
            {
                text: "삭제", style: "destructive", onPress: async () => {
                    try {
                        await deleteAnnouncement(id);
                        // 즉시 제거 (방송도 오지만 즉시 반응)
                        setHistory(prev => prev.filter(n => n.id !== id));
                    } catch (err) {
                        console.error(err);
                        Alert.alert("오류", "공지 삭제에 실패했습니다.");
                    }
                }
            }
        ]);
    };

    return (
        <SafeAreaView style={s.container}>
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={26} color="#111" />
                </TouchableOpacity>
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
                        <TextInput
                            value={content} onChangeText={setContent} placeholder="내용"
                            style={[s.input, { height: 120 }]} multiline
                        />
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
        height: 56, paddingHorizontal: 16, flexDirection: "row",
        alignItems: "center", justifyContent: "space-between",
        borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#ddd",
    },
    title: { fontSize: 18, fontWeight: "700", color: "#111" },
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
    input: {
        borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 12,
        marginBottom: 12, fontSize: 15, backgroundColor: "#fff",
    },
    cancel: { fontSize: 16, color: "#777", paddingHorizontal: 8, paddingVertical: 6 },
    submit: { fontSize: 16, color: "#111", fontWeight: "700", paddingHorizontal: 8, paddingVertical: 6 },
});
