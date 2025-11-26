import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { getPayListByMember } from "@/api/pay.api";

type PayListItem = {
    id: number;
    period?: string;         // "2025-11"
    totalHours?: number;
    hourlyWage?: number;
    finalPay?: number;       // 실지급(혹은 gross/net 중 하나일 수도)
    gross?: number;          // 총지급
    net?: number;            // 실지급
    status?: string;         // e.g. "CALCULATED" | "PAID"
};

const won = (n: any) => `₩ ${Number(n || 0).toLocaleString()}`;

export default function PayListScreen({ navigation }: any) {
    const user = useSelector((state: RootState) => state.user);
    const memberId = user.id;

    const [payList, setPayList] = useState<PayListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async () => {
        if (!memberId) return;
        try {
            setLoading(true);
            const data = await getPayListByMember(memberId);
            setPayList(Array.isArray(data) ? data : []);
        } catch (e) {
            console.log("급여 목록 불러오기 오류:", e);
            setPayList([]);
        } finally {
            setLoading(false);
        }
    }, [memberId]);

    useEffect(() => { load(); }, [load]);

    const onRefresh = useCallback(async () => {
        try {
            setRefreshing(true);
            await load();
        } finally {
            setRefreshing(false);
        }
    }, [load]);

    if (loading) {
        return (
            <SafeAreaView style={s.container}>
                <ActivityIndicator size="large" style={{ marginTop: 30 }} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={s.container}>
            {/* 헤더 */}
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={26} color="#111" />
                </TouchableOpacity>
                <Text style={s.title}>💰 급여 내역</Text>
                <View style={{ width: 26 }} />
            </View>

            {/* 급여 리스트 */}
            <ScrollView
                contentContainerStyle={s.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {payList.length === 0 ? (
                    <Text style={{ color: "#777", marginTop: 20, textAlign: "center" }}>
                        급여 내역이 없습니다.
                    </Text>
                ) : (
                    payList.map((item) => {
                        // 필드 이름이 달라도 안전하게 매핑
                        const period = item.period ?? "";
                        const hours = item.totalHours ?? 0;
                        const wage = item.hourlyWage ?? 0;

                        // 실지급(최우선: net -> finalPay)
                        const net = (item as any).net ?? item.finalPay ?? 0;

                        const status = (item.status ?? "CALCULATED")
                            .replace("CALCULATED", "계산완료")
                            .replace("PAID", "지급완료");

                        return (
                            <TouchableOpacity
                                key={item.id}
                                style={s.card}
                                activeOpacity={0.85}
                                onPress={() => navigation.navigate("PayDetail", { payId: item.id })}
                            >
                                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                    <Text style={s.period}>{period}</Text>
                                    <View style={s.badge}>
                                        <Text style={s.badgeText}>{status}</Text>
                                    </View>
                                </View>

                                <View style={{ height: 8 }} />

                                <Text style={s.detail}>근무시간: {Number(hours)}시간</Text>
                                <Text style={s.detail}>시급: {won(wage)}</Text>

                                <Text style={s.finalPayLabel}>실지급액</Text>
                                <Text style={s.finalPayValue}>{won(net)}</Text>
                            </TouchableOpacity>
                        );
                    })
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f8f9fb" },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        elevation: 2,
    },
    title: { fontSize: 18, fontWeight: "bold", color: "#111" },
    content: { padding: 16 },

    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
    },
    period: { fontSize: 16, fontWeight: "bold" },
    detail: { fontSize: 14, color: "#333", marginTop: 2 },

    finalPayLabel: { marginTop: 10, fontSize: 12, color: "#666" },
    finalPayValue: { fontSize: 18, fontWeight: "bold", color: "#007AFF", marginTop: 2 },

    badge: {
        backgroundColor: "#EEF2FF",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
    },
    badgeText: { color: "#4338CA", fontSize: 12, fontWeight: "600" },
});
