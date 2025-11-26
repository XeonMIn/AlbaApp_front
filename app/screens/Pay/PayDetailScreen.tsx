// app/screens/Pay/PayDetailScreen.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { getPayDetail, getLatestPay } from "@/api/pay.api";

const won = (v: any) => `₩ ${Number(v || 0).toLocaleString()}`;
const hour = (v: any) => `${Number(v || 0)} h`;

export default function PayDetailScreen({ route, navigation }: any) {
    const payId: number | undefined = route?.params?.payId ?? undefined;

    // Redux 값(raw) → undefined로 정리
    const { id: rawMemberId, workplaceId: rawWpId } = useSelector(
        (s: RootState) => s.user
    );
    const memberId: number | undefined = rawMemberId ?? undefined;
    const workplaceId: number | undefined = rawWpId ?? undefined;

    const [detail, setDetail] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);

                let data: any | null = null;

                // 1) payId 있으면 먼저 상세 조회
                if (payId) {
                    try {
                        data = await getPayDetail(payId);
                    } catch (e) {
                        console.log("[PayDetail] getPayDetail error:", e);
                    }
                }

                // 2) 상세가 없거나(혹은 요약만 온 경우) → 최신 급여로 폴백
                const lacksBreakdown =
                    !data ||
                    (data.basePay == null &&
                        data.regularPay == null &&
                        data.gross == null &&
                        data.net == null);

                if ((!payId || lacksBreakdown) && memberId) {
                    try {
                        const latest = await getLatestPay(memberId, workplaceId);
                        data = data ? { ...latest, ...data } : latest;
                    } catch (e) {
                        console.log("[PayDetail] getLatestPay fallback error:", e);
                    }
                }

                setDetail(data ?? null);
            } finally {
                setLoading(false);
            }
        })();
    }, [payId, memberId, workplaceId]);

    // ── 응답 키 매핑(사장 화면과 동일 구성) ──
    const d = useMemo(() => {
        const x = detail ?? {};
        const year = x.year ?? x.period?.split?.("-")?.[0] ?? "";
        const month = x.month ?? x.period?.split?.("-")?.[1] ?? "";

        const periodText = x.period
            ? x.period.replace("-", "년 ") + "월"
            : year && month
                ? `${year}년 ${month}월`
                : "";

        // 시간
        const totalHours = x.totalHours ?? x.workHours ?? 0;
        const nightHours = x.nightHours ?? 0;
        const holidayHours = x.holidayHours ?? 0;

        // 지급
        const basePay = x.basePay ?? x.regularPay ?? 0;
        const nightPay = x.nightPay ?? 0;
        const holidayPay = x.holidayPay ?? 0;

        // 총지급
        const gross =
            x.gross ?? Number(basePay) + Number(nightPay) + Number(holidayPay);

        // 공제
        const tax = x.tax ?? x.taxDeduction ?? 0;
        const insurances = x.insurances ?? x.insuranceDeduction ?? 0;

        // 실지급
        const net =
            x.net ?? x.finalPay ?? Number(gross) - Number(tax) - Number(insurances);

        return {
            periodText,
            totalHours,
            nightHours,
            holidayHours,
            basePay,
            nightPay,
            holidayPay,
            tax,
            insurances,
            net,
        };
    }, [detail]);

    if (loading || !detail) {
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
                <Text style={s.headerTitle}>급여 상세</Text>
                <View style={{ width: 26 }} />
            </View>

            {/* 본문(사장 화면과 같은 카드 레이아웃) */}
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
                <Text style={s.title}>{d.periodText}</Text>

                <View style={s.card}>
                    <Row label="총 근무시간" value={hour(d.totalHours)} boldValue />
                    <Row label="야간시간" value={hour(d.nightHours)} />
                    <Row label="주휴시간" value={hour(d.holidayHours)} />
                    <View style={s.hr} />

                    <Row label="기본급" value={won(d.basePay)} boldValue />
                    <Row label="야간수당" value={won(d.nightPay)} boldValue />
                    <Row label="주휴수당" value={won(d.holidayPay)} boldValue />
                    <View style={s.hr} />

                    <Row label="공제(세금)" value={`- ${won(d.tax)}`} />
                    <Row label="공제(4대보험)" value={`- ${won(d.insurances)}`} />
                    <View style={s.hr} />

                    <View style={[s.row, { paddingVertical: 8 }]}>
                        <Text style={[s.label, { fontWeight: "800" }]}>실지급액</Text>
                        <Text
                            style={[
                                s.value,
                                { fontWeight: "800", color: "#2563EB", fontSize: 18 },
                            ]}
                        >
                            {won(d.net)}
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function Row({
                 label,
                 value,
                 boldValue,
             }: {
    label: string;
    value: string;
    boldValue?: boolean;
}) {
    return (
        <View style={s.row}>
            <Text style={s.label}>{label}</Text>
            <Text style={[s.value, boldValue && { fontWeight: "700" }]}>{value}</Text>
        </View>
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
    },
    headerTitle: { fontSize: 18, fontWeight: "700", color: "#111" },
    title: { fontSize: 26, fontWeight: "900", color: "#111", marginBottom: 12 },
    card: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "#ECEFF3",
        elevation: 2,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 8,
    },
    label: { fontSize: 18, color: "#6B7280", fontWeight: "800" },
    value: { fontSize: 18, color: "#111827" },
    hr: { height: 1, backgroundColor: "#E5E7EB", marginVertical: 12 },
});
