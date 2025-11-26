import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { getTodayStatusList, type TodayStatusDto } from "@/api/attendance.api";

function badgeStyle(status: string) {
    if (status === "CHECKED_IN")  return { bg: "#DCFCE7", fg: "#16A34A", label: "근무중" };
    if (status === "CHECKED_OUT") return { bg: "#E0E7FF", fg: "#6366F1", label: "퇴근" };
    return { bg: "#F3F4F6", fg: "#6B7280", label: "미출근" };
}

export default function CheckedInListScreen() {
    const navigation = useNavigation();
    const { workplaceId } = useSelector((s: RootState) => s.user);
    const [loading, setLoading] = useState(false);
    const [list, setList] = useState<TodayStatusDto[]>([]);

    useEffect(() => {
        (async () => {
            if (!workplaceId) {
                setList([]);
                return;
            }
            try {
                setLoading(true);
                const res = await getTodayStatusList(workplaceId);
                // 정렬: 근무중 → 퇴근 → 미출근, 그 다음 이름순
                const sorted = [...res].sort((a, b) => {
                    const rank = (t: string) => (t === "CHECKED_IN" ? 0 : t === "CHECKED_OUT" ? 1 : 2);
                    const r = rank(a.status) - rank(b.status);
                    if (r !== 0) return r;
                    return (a.memberName ?? "").localeCompare(b.memberName ?? "");
                });
                setList(sorted);
            } finally {
                setLoading(false);
            }
        })();
    }, [workplaceId]);

    return (
        <SafeAreaView style={s.safe}>
            {/* 헤더 */}
            <View style={s.header}>
                <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={24} color="#111" />
                </TouchableOpacity>
                <Text style={s.headerTitle}>오늘 근무 현황</Text>
                <View style={s.rightSpacer} />
            </View>

            {/* 본문 */}
            <View style={s.container}>
                {!workplaceId ? (
                    <View style={s.center}><Text>대표 매장을 먼저 선택해주세요.</Text></View>
                ) : loading ? (
                    <View style={s.center}><ActivityIndicator /></View>
                ) : list.length === 0 ? (
                    <View style={s.center}><Text>등록된 직원이 없습니다.</Text></View>
                ) : (
                    <FlatList
                        data={list}
                        keyExtractor={(x) => `${x.memberId}`} // 멤버당 1건 → 고유 key 보장
                        renderItem={({ item }) => {
                            const k = badgeStyle(item.status);
                            return (
                                <View style={s.card}>
                                    <View style={s.rowTop}>
                                        <Text style={s.name}>{item.memberName ?? "직원"}</Text>
                                        <View style={[s.badge, { backgroundColor: k.bg }]}>
                                            <Text style={[s.badgeText, { color: k.fg }]}>{k.label}</Text>
                                        </View>
                                    </View>

                                    <View style={s.rowBottom}>
                                        <View style={s.timeCell}>
                                            <Text style={s.timeLabel}>출근</Text>
                                            <Text style={s.timeValue}>{item.checkInAt ?? "-"}</Text>
                                        </View>
                                        <View style={s.divider} />
                                        <View style={s.timeCell}>
                                            <Text style={s.timeLabel}>퇴근</Text>
                                            <Text style={s.timeValue}>{item.checkOutAt ?? (item.status==="CHECKED_IN" ? "근무중" : "-")}</Text>
                                        </View>
                                    </View>
                                </View>
                            );
                        }}
                        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                        contentContainerStyle={{ padding: 16 }}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "#f8f9fb" },

    header: {
        height: 52,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 8,
        backgroundColor: "#f8f9fb",
    },
    backBtn: {
        width: 44, height: 44, alignItems: "center", justifyContent: "center", borderRadius: 22,
    },
    headerTitle: { fontSize: 18, fontWeight: "700", color: "#111" },
    rightSpacer: { width: 44, height: 44 },

    container: { flex: 1, backgroundColor: "#f8f9fb" },
    center: { flex: 1, alignItems: "center", justifyContent: "center" },

    card: {
        backgroundColor: "#fff",
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 16,
        // shadow (iOS) + elevation (Android)
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 2,
    },

    rowTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
    name: { fontSize: 16, fontWeight: "700", color: "#111" },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
    badgeText: { fontSize: 12, fontWeight: "700" },

    rowBottom: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F9FAFB",
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    timeCell: { flex: 1, alignItems: "center" },
    timeLabel: { fontSize: 12, color: "#6B7280", marginBottom: 2 },
    timeValue: { fontSize: 16, fontWeight: "700", color: "#111827" },
    divider: { width: 1, height: 20, backgroundColor: "#E5E7EB", marginHorizontal: 8 },
});
