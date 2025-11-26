// app/screens/Pay/PayDetailQuickScreen.tsx
import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";

import { getLatestPay } from "@/api/pay.api";
import { getPayrollSummary, type PayrollLine } from "@/api/payroll.api";

/** 야간 가산율(백엔드와 동일 가정) */
const NIGHT_BONUS_RATE = 0.5;

/** 표시용 헬퍼 */
const won  = (v: unknown) => `₩ ${Number(v ?? 0).toLocaleString()}`;
const hour = (v: unknown) => `${Number(v ?? 0)} h`;
const num  = (v: unknown, d = 0) => (v == null || isNaN(Number(v)) ? d : Number(v));

type LatestPayLike = {
    year?: number; month?: number; period?: string;
    hourlyWage?: number; wage?: number;
    employmentId?: number; employment?: { id?: number };
    totalHours?: number; workHours?: number;
    nightHours?: number; holidayHours?: number;
    basePay?: number; regularPay?: number;
    nightPay?: number; holidayPay?: number;
    gross?: number; tax?: number; taxDeduction?: number;
    insurances?: number; insuranceDeduction?: number;
    net?: number; finalPay?: number;
};

export default function PayDetailQuickScreen() {
    // Redux에서 내 회원/근무지
    const { id: rawMemberId, workplaceId: rawWpId } = useSelector((s: RootState) => s.user);
    const memberId    : number | undefined = rawMemberId ?? undefined;
    const workplaceId : number | undefined = rawWpId ?? undefined;

    const [latest, setLatest] = useState<LatestPayLike | null>(null);
    const [ownerLine, setOwnerLine] = useState<PayrollLine | null>(null);
    const [loading, setLoading] = useState(true);

    /** 최신 급여 → (가능하면) 사장용 요약도 같이 로드 */
    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                if (!memberId) { setLatest(null); setOwnerLine(null); return; }

                // 1) 최신 급여
                const lp: LatestPayLike = await getLatestPay(memberId, workplaceId);
                setLatest(lp);

                // 2) 사장 화면 요약 끌어오기 (year/month/empId는 latest에서만 유도)
                const y = lp?.year ?? (typeof lp?.period === "string" ? Number(lp.period.split("-")[0]) : undefined);
                const m = lp?.month ?? (typeof lp?.period === "string" ? Number(lp.period.split("-")[1]) : undefined);
                const empId =
                    lp?.employmentId ??
                    lp?.employment?.id;

                if (workplaceId && y && m && empId) {
                    try {
                        const summary = await getPayrollSummary(workplaceId, y, m, empId);
                        const line = summary?.lines?.[0] ?? null;
                        if (line) setOwnerLine(line);
                    } catch {
                        setOwnerLine(null);
                    }
                } else {
                    setOwnerLine(null);
                }
            } finally {
                setLoading(false);
            }
        })();
    }, [memberId, workplaceId]);

    /** 표시에 사용할 최종 데이터(사장 요약이 있으면 그 값을 우선 사용) */
    const d = useMemo(() => {
        // 기간(오직 latest 기반으로 계산: PayrollLine에는 year/month가 없음)
        const ly = latest?.year ?? (typeof latest?.period === "string" ? Number(latest?.period.split("-")[0]) : undefined);
        const lm = latest?.month ?? (typeof latest?.period === "string" ? Number(latest?.period.split("-")[1]) : undefined);
        const periodText =
            ly && lm ? `${ly}년 ${lm}월`
                : (typeof latest?.period === "string" ? `${latest?.period.replace("-", "년 ")}월` : "");

        // 시간
        const totalHours   = num(ownerLine?.workHours   ?? (latest?.totalHours ?? latest?.workHours), 0);
        const nightHours   = num(ownerLine?.nightHours  ?? latest?.nightHours, 0);
        const holidayHours = num(ownerLine?.holidayHours?? latest?.holidayHours, 0);

        // 시급
        const wage = num(
            // ownerLine에 시급 필드가 없을 수 있으므로 latest 우선
            (latest?.hourlyWage ?? latest?.wage),
            0
        );

        // 지급(사장 요약 우선)
        const basePaySrv    = ownerLine?.basePay    ?? (latest?.basePay ?? latest?.regularPay);
        const nightPaySrv   = ownerLine?.nightPay   ?? latest?.nightPay;
        const holidayPaySrv = ownerLine?.holidayPay ?? latest?.holidayPay;

        const basePay    = num(basePaySrv,    totalHours   * wage);
        const nightPay   = num(nightPaySrv,   nightHours   * wage * NIGHT_BONUS_RATE);
        const holidayPay = num(holidayPaySrv, holidayHours * wage);

        // 총지급/공제/실지급(사장 요약 우선)
        const gross      = num(ownerLine?.gross      ?? latest?.gross, basePay + nightPay + holidayPay);
        const tax        = num(ownerLine?.tax        ?? (latest?.tax ?? latest?.taxDeduction), 0);
        const insurances = num(ownerLine?.insurances ?? (latest?.insurances ?? latest?.insuranceDeduction), 0);
        const net        = num(ownerLine?.net        ?? (latest?.net ?? latest?.finalPay), gross - tax - insurances);

        return {
            periodText,
            totalHours, nightHours, holidayHours,
            basePay, nightPay, holidayPay,
            tax, insurances, net,
        };
    }, [ownerLine, latest]);

    if (loading) {
        return (
            <SafeAreaView style={s.container}>
                <ActivityIndicator size="large" style={{ marginTop: 30 }} />
            </SafeAreaView>
        );
    }

    if (!latest && !ownerLine) {
        return (
            <SafeAreaView style={s.container}>
                <View style={{ padding: 16 }}>
                    <Text style={{ color: "#666" }}>표시할 급여 데이터가 없습니다.</Text>
                </View>
            </SafeAreaView>
        );
    }

    /** UI — 사장 카드와 동일 구성 */
    return (
        <SafeAreaView style={s.container}>
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
                        <Text style={[s.value, { fontWeight: "800", color: "#2563EB", fontSize: 18 }]}>
                            {won(d.net)}
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

/** 공용 행 */
function Row({ label, value, boldValue }: { label: string; value: string; boldValue?: boolean }) {
    return (
        <View style={s.row}>
            <Text style={s.label}>{label}</Text>
            <Text style={[s.value, boldValue && { fontWeight: "700" }]}>{value}</Text>
        </View>
    );
}

/** 스타일 */
const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f8f9fb" },
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
