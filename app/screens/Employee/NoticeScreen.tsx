import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { fetchAnnouncements, AnnouncementDto } from "@/api/announcement.api";
import { useNoticeTopic } from "@/app/utils/useNoticeTopic";

function parseDate(s?: string) {
    if (!s) return 0;
    return new Date(s.replace(" ", "T")).getTime() || 0;
}

export default function NoticeScreen({ navigation }: any) {
    const user = useSelector((s: RootState) => s.user);
    const workplaceId: number | undefined = user.workplaceId ?? undefined;
    const token: string | undefined = user.accessToken ?? undefined;

    const [loading, setLoading] = useState(true);
    const [history, setHistory] = useState<AnnouncementDto[]>([]);
    const { notices } = useNoticeTopic(workplaceId, token);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            if (!workplaceId) { setLoading(false); return; }
            setLoading(true);
            try {
                const data = await fetchAnnouncements(workplaceId);
                if (!cancelled) setHistory(data);
            } catch (e) {
                console.warn("[NOTICE] history fetch error:", e);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [workplaceId]);

    const merged = useMemo(() => {
        const map = new Map<number | string, AnnouncementDto>();
        // id가 있으면 id로, 없으면 fallback key
        const k = (n: AnnouncementDto, i: number) => n.id ?? `${n.title}__${n.content}__${n.createdtime ?? ""}__${i}`;
        [...notices, ...history].forEach((n, i) => map.set(k(n, i), n));
        return Array.from(map.values()).sort((a, b) => parseDate(b.createdtime) - parseDate(a.createdtime));
    }, [notices, history]);

    return (
        <SafeAreaView style={s.container}>
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={26} color="#111" />
                </TouchableOpacity>
                <Text style={s.title}>공지사항</Text>
                <View style={{ width: 26 }} />
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
                        </View>
                    ))}
                </ScrollView>
            )}
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
});
