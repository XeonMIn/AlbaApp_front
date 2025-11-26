// app/screens/Pay/OwnerPayrollManageScreen.tsx
import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import dayjs from "dayjs";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { getPayrollSummary, recalcPayroll, type PayrollLine } from "@/api/payroll.api";

const NIGHT_BONUS_RATE = 0.5; // 50%

// 낙관적 재계산(저장 직후 즉시 반영)
function recomputeLine(line: PayrollLine, newWage: number): PayrollLine {
    const workHours    = Number(line.workHours ?? 0);
    const nightHours   = Number(line.nightHours ?? 0);
    const holidayHours = Number(line.holidayHours ?? 0);

    const basePay    = Math.round(workHours * newWage);
    const nightPay   = Math.round(nightHours * newWage * NIGHT_BONUS_RATE);
    const holidayPay = Math.round(holidayHours * newWage);

    const gross      = basePay + nightPay + holidayPay;
    const tax        = Number(line.tax ?? 0);
    const insurances = Number(line.insurances ?? 0);
    const net        = gross - tax - insurances;

    return {
        ...line,
        hourlyWage: newWage,
        basePay,
        nightPay,
        holidayPay,
        gross,
        net,
    };
}

export default function OwnerPayrollManageScreen({ }: any) {
    const navigation = useNavigation<any>();
    const { workplaceId } = useSelector((s: RootState) => s.user);
    const [loading, setLoading] = useState(false);
    const [lines, setLines] = useState<PayrollLine[]>([]);
    const [year] = useState(dayjs().year());
    const [month] = useState(dayjs().month() + 1);

    const reload = useCallback(async () => {
        if (!workplaceId) return;
        setLoading(true);
        try {
            const s = await getPayrollSummary(workplaceId, year, month);
            setLines(s.lines || []);
        } finally {
            setLoading(false);
        }
    }, [workplaceId, year, month]);

    // 최초 로드
    useEffect(() => { reload(); }, [reload]);

    // 편집 화면에서 돌아왔을 때 자동 새로고침
    useFocusEffect(
        useCallback(() => {
            reload();
        }, [reload])
    );

    const onRecalc = async () => {
        if (!workplaceId) return;
        setLoading(true);
        try {
            const s = await recalcPayroll(workplaceId, year, month);
            setLines(s.lines || []);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
            {/* 상단 헤더 (안전영역) */}
            <View style={s.headerBar}>
                <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="chevron-back" size={26} color="#111" />
                </TouchableOpacity>
                <Text style={s.headerTitle}>사장님 급여 관리</Text>
                <TouchableOpacity style={s.refreshBtn} onPress={onRecalc}>
                    <Ionicons name="refresh" size={18} color="#fff" />
                </TouchableOpacity>
            </View>

            <Text style={s.subTitle}>{year}년 {month}월</Text>

            {loading ? (
                <ActivityIndicator style={{ marginTop: 20 }} />
            ) : (
                <ScrollView contentContainerStyle={{ padding: 16 }}>
                    {lines.map(line => (
                        <TouchableOpacity
                            key={line.employmentId}
                            style={s.card}
                            onPress={() =>
                                navigation.navigate("OwnerPayrollEdit", {
                                    employmentId: line.employmentId,
                                    ym: { year, month },
                                    // ✅ 저장 시 즉시 반영
                                    onUpdated: (newWage: number) => {
                                        setLines(prev =>
                                            prev.map(l =>
                                                l.employmentId === line.employmentId
                                                    ? recomputeLine(l, newWage)
                                                    : l
                                            )
                                        );
                                    },
                                })
                            }
                        >
                            <Text style={s.name}>{line.memberName}</Text>
                            <Text style={s.meta}>
                                {year}년 {month}월 · 근무시간: {Number(line.workHours ?? 0)}시간 · 시급: ₩{Number(line.hourlyWage ?? 0).toLocaleString()}
                            </Text>
                            <Text style={s.total}>실지급액: ₩{Number(line.net ?? 0).toLocaleString()}</Text>
                            <Text style={s.status}>상태: 예정</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    headerBar: {
        paddingHorizontal: 12,
        paddingTop: 8,
        paddingBottom: 8,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottomWidth: 1,
        borderBottomColor: "#EEE",
        backgroundColor: "#fff",
    },
    headerTitle: { fontSize: 18, fontWeight: "700", color: "#111" },
    refreshBtn: { backgroundColor: "#2563EB", paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8 },
    subTitle: { marginLeft: 16, color: "#6B7280", marginTop: 8, marginBottom: 4 },
    card: { backgroundColor: "#fff", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "#E5E7EB", marginBottom: 12 },
    name: { fontSize: 16, fontWeight: "700" },
    meta: { color: "#6B7280", marginTop: 2 },
    total: { color: "#1D4ED8", marginTop: 6, fontWeight: "700" },
    status: { color: "#6B7280", marginTop: 2 },
});
