// app/screens/Pay/OwnerPayrollEditScreen.tsx
import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { getPayrollSummary, type PayrollLine, updateWage } from "@/api/payroll.api";

type RouteParams = { employmentId: number; ym: { year: number; month: number } };

// 야간 가산율(사장 화면과 동일 가정)
const NIGHT_BONUS_RATE = 0.5;

// 화면 즉시 반영을 위한 낙관적 재계산
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

export default function OwnerPayrollEditScreen({ route, navigation }: any) {
    const { employmentId, ym } = route.params as RouteParams;
    const { workplaceId } = useSelector((s: RootState) => s.user);

    const [loading, setLoading] = useState(false);
    const [line, setLine] = useState<PayrollLine | null>(null);
    const [hourlyWage, setHourlyWage] = useState<string>("");

    const pickLine = useCallback((lines?: PayrollLine[] | null) => {
        if (!lines || lines.length === 0) return null;
        const exact = lines.find(l => l.employmentId === employmentId);
        return exact ?? lines[0];
    }, [employmentId]);

    const load = useCallback(async () => {
        if (!workplaceId) return;
        setLoading(true);
        try {
            const s = await getPayrollSummary(workplaceId, ym.year, ym.month, employmentId);
            const l = pickLine(s?.lines);
            setLine(l ?? null);
            if (l) setHourlyWage(String(l.hourlyWage ?? ""));
        } finally {
            setLoading(false);
        }
    }, [workplaceId, ym?.year, ym?.month, employmentId, pickLine]);

    useEffect(() => { load(); }, [load]);

    const onSave = useCallback(async () => {
        const w = parseInt((hourlyWage ?? "").replace(/[^\d]/g, ""), 10) || 0;
        if (w <= 0) return;

        // 부모 리스트 즉시 반영(있을 때)
        route?.params?.onUpdated?.(w);

        try {
            await updateWage(employmentId, w);

            // 현재 화면도 즉시 반영(낙관 계산)
            setLine(prev => (prev ? recomputeLine(prev, w) : prev));
            setHourlyWage(String(w));

            // 성공 팝업 1개만 노출
            Alert.alert("저장 완료", "시급이 저장되었어요.");
        } catch (e) {
            console.log("[OwnerPayrollEdit] updateWage failed:", e);
        }
    }, [hourlyWage, employmentId, route?.params]);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
            {/* 상단 헤더(안전영역) */}
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="chevron-back" size={26} color="#111" />
                </TouchableOpacity>
                <Text style={s.headerTitle}>시급/급여 편집</Text>
                <View style={{ width: 26 }} />
            </View>

            <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
                <Text style={{ fontSize: 22, fontWeight: "800" }}>{ym.year}년 {ym.month}월</Text>
                {/* 고용 ID 표시는 제거 */}
            </View>

            {loading && <ActivityIndicator style={{ marginTop: 20 }} />}

            {(!loading && !line) && (
                <View style={{ padding: 16 }}>
                    <Text style={{ color: "#666" }}>이 직원의 급여 요약을 찾을 수 없습니다.</Text>
                </View>
            )}

            {line && (
                <View style={{ paddingHorizontal: 16 }}>
                    {/* 자동 계산 요약 */}
                    <View style={s.box}>
                        <Text style={s.row}><Text style={s.k}>총 근무시간</Text>     <Text>{Number(line.workHours ?? 0)} h</Text></Text>
                        <Text style={s.row}><Text style={s.k}>야간시간</Text>       <Text>{Number(line.nightHours ?? 0)} h</Text></Text>
                        <Text style={s.row}><Text style={s.k}>주휴시간</Text>       <Text>{Number(line.holidayHours ?? 0)} h</Text></Text>
                        <View style={s.sep}/>
                        <Text style={s.row}><Text style={s.k}>기본급</Text>         <Text>₩{Number(line.basePay ?? 0).toLocaleString()}</Text></Text>
                        <Text style={s.row}><Text style={s.k}>야간수당</Text>        <Text>₩{Number(line.nightPay ?? 0).toLocaleString()}</Text></Text>
                        <Text style={s.row}><Text style={s.k}>주휴수당</Text>        <Text>₩{Number(line.holidayPay ?? 0).toLocaleString()}</Text></Text>
                        <View style={s.sep}/>
                        <Text style={s.row}><Text style={s.k}>공제(세금)</Text>     <Text>-₩{Number(line.tax ?? 0).toLocaleString()}</Text></Text>
                        <Text style={s.row}><Text style={s.k}>공제(4대보험)</Text>  <Text>-₩{Number(line.insurances ?? 0).toLocaleString()}</Text></Text>
                        <View style={s.sep}/>
                        <Text style={[s.row, { fontWeight: "800" }]}><Text style={s.k}>실지급액</Text> <Text>₩{Number(line.net ?? 0).toLocaleString()}</Text></Text>
                    </View>

                    {/* 시급 입력(저장 후에도 입력값 유지) */}
                    <Text style={s.label}>시급</Text>
                    <TextInput
                        style={s.input}
                        value={hourlyWage}
                        onChangeText={setHourlyWage}
                        placeholder="시급(숫자)"
                        keyboardType="default"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />

                    <TouchableOpacity style={s.btn} onPress={onSave}>
                        <Text style={s.btnText}>저장</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    header: {
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

    box: { borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, padding: 12, marginBottom: 16 },
    row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
    k: { color: "#6B7280" },
    sep: { height: 1, backgroundColor: "#F3F4F6", marginVertical: 8 },

    label: { marginTop: 8, marginBottom: 6, fontWeight: "700" },
    input: { borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 8, height: 44, paddingHorizontal: 12, marginBottom: 12 },
    btn: { backgroundColor: "#2563EB", height: 48, borderRadius: 10, alignItems: "center", justifyContent: "center", marginTop: 8 },
    btnText: { color: "#fff", fontWeight: "800" },
});
