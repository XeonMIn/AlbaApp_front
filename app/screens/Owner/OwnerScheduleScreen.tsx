import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar } from "react-native-calendars";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import dayjs from "dayjs";
import { createShift, deleteShift, fetchShiftsByDate, fetchShiftsRange, type Shift } from "@/api/shift.api";
import { fetchEmploymentsByWorkplace, type EmploymentSimple } from "@/api/employment.api";

function hhmm(v: string) { const m = v.match(/^(\d{2}):(\d{2})/); return m ? `${m[1]}:${m[2]}` : v; }
const toggle = (arr: number[], id: number) => (arr.includes(id) ? arr.filter(x=>x!==id) : [...arr, id]);

export default function OwnerScheduleScreen() {
    const { workplaceId, id: myMemberId } = useSelector((s: RootState) => s.user);
    const [selected, setSelected] = useState(dayjs().format("YYYY-MM-DD"));
    const [inputStart, setInputStart] = useState("09:00");
    const [inputEnd, setInputEnd] = useState("13:00");
    const [items, setItems] = useState<Shift[]>([]);
    const [marks, setMarks] = useState<any>({});
    const [emps, setEmps] = useState<EmploymentSimple[]>([]);
    const [selectedEmps, setSelectedEmps] = useState<number[]>([]);

    // ✅ 직원 목록 로드: EmploymentMemberDto[] -> EmploymentSimple[] 매핑 + 사장(본인) 제외
    useEffect(() => {
        if (!workplaceId) return;
        fetchEmploymentsByWorkplace(workplaceId)
            .then(list => {
                const mapped: EmploymentSimple[] = list.map(x => ({
                    id: x.employmentId,
                    memberId: x.memberId,
                    memberName: x.memberName,
                }));
                // 본인(사장) employment 제거 (오너 계정이 employment로 묶여 있는 경우 대비)
                const onlyStaff = mapped.filter(e => e.memberId !== myMemberId);
                setEmps(onlyStaff);
            })
            .catch(() => setEmps([]));
    }, [workplaceId, myMemberId]);

    const monthKey = dayjs(selected).format("YYYY-MM");
    useEffect(() => {
        if (!workplaceId) return;
        const start = dayjs(selected).startOf("month").format("YYYY-MM-DD");
        const end = dayjs(selected).endOf("month").format("YYYY-MM-DD");
        fetchShiftsRange(workplaceId, start, end).then(list => {
            const grouped = list.reduce<Record<string, number>>((acc, s) => {
                acc[s.workDate] = (acc[s.workDate] || 0) + 1; return acc;
            }, {});
            const m: any = {};
            Object.keys(grouped).forEach(d => { m[d] = { marked: true }; });
            m[selected] = { ...(m[selected] || {}), selected: true, selectedColor: "#4F46E5" };
            setMarks(m);
        }).catch(()=>{});
    }, [workplaceId, monthKey, selected]);

    const loadDay = (date: string) => {
        if (!workplaceId) return;
        fetchShiftsByDate(workplaceId, date).then(setItems).catch(()=>setItems([]));
    };
    useEffect(() => { loadDay(selected); }, [workplaceId, selected]);

    const nameMap = useMemo(() => Object.fromEntries(emps.map(e => [e.id, e.memberName])), [emps]);

    const onAdd = async () => {
        if (!workplaceId) return;
        try {
            if (!/^\d{2}:\d{2}$/.test(inputStart) || !/^\d{2}:\d{2}$/.test(inputEnd)) {
                Alert.alert("시간 형식", "HH:mm 형식으로 입력하세요. 예) 09:00"); return;
            }
            if (selectedEmps.length === 0) {
                Alert.alert("대상 선택", "알바를 한 명 이상 선택하세요."); return;
            }
            const s = await createShift({
                workplaceId,
                workDate: selected,
                startTime: inputStart,
                endTime: inputEnd,
                employmentIds: selectedEmps,
            });
            setItems(prev => [...prev, s].sort((a,b)=>a.startTime.localeCompare(b.startTime)));
        } catch (e: any) {
            Alert.alert("등록 실패", e?.response?.data || "잠시 후 다시 시도하세요.");
        }
    };

    const onDelete = (id: number) => {
        Alert.alert("삭제", "이 근무 일정을 삭제할까요?", [
            { text: "취소", style: "cancel" },
            { text: "삭제", style: "destructive", onPress: async () => {
                    try { await deleteShift(id); setItems(prev => prev.filter(x=>x.id!==id)); }
                    catch (e:any){ Alert.alert("삭제 실패", e?.response?.data || "잠시 후 다시 시도하세요."); }
                }}
        ]);
    };

    return (
        <SafeAreaView style={s.container}>
            <Calendar
                onDayPress={(d)=>setSelected(d.dateString)}
                markedDates={marks}
                onMonthChange={(m)=>{
                    const d = dayjs(`${m.year}-${String(m.month).padStart(2,"0")}-01`).format("YYYY-MM-DD");
                    setSelected(d);
                }}
            />
            <View style={s.form}>
                <Text style={s.date}>{selected}</Text>

                {/* 여러 알바 선택 */}
                <View style={{ marginTop: 8, marginBottom: 8 }}>
                    <Text style={{ fontWeight: "600", marginBottom: 6 }}>알바 선택(복수 선택 필수):</Text>
                    <View style={s.empRow}>
                        {emps.map(e => {
                            const active = selectedEmps.includes(e.id);
                            return (
                                <TouchableOpacity
                                    key={e.id}
                                    style={[s.empChip, active && s.empChipActive]}
                                    onPress={()=>setSelectedEmps(prev=>toggle(prev, e.id))}
                                >
                                    <Text style={active ? s.empChipTextActive : s.empChipText}>
                                        {e.memberName}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                <View style={s.row}>
                    <TextInput
                        style={s.input}
                        value={inputStart}
                        onChangeText={setInputStart}
                        placeholder="시작 (HH:mm)"
                        keyboardType="default"
                        autoCapitalize="none"
                        autoCorrect={false}
                        maxLength={5}
                    />
                    <Text style={s.tilde}>~</Text>
                    <TextInput
                        style={s.input}
                        value={inputEnd}
                        onChangeText={setInputEnd}
                        placeholder="종료 (HH:mm)"
                        keyboardType="default"
                        autoCapitalize="none"
                        autoCorrect={false}
                        maxLength={5}
                    />
                    <TouchableOpacity style={s.btn} onPress={onAdd}>
                        <Text style={s.btnText}>추가</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                data={[...items].sort((a,b)=>a.startTime.localeCompare(b.startTime))}
                keyExtractor={(it)=>String(it.id)}
                renderItem={({ item }) => (
                    <View style={s.item}>
                        <Text style={s.itemTime}>{hhmm(item.startTime)}~{hhmm(item.endTime)}</Text>
                        <Text style={s.itemSub}>
                            {item.employmentIds?.length
                                ? `배정: ${item.employmentIds.map(id => nameMap[id] ?? `#${id}`).join(", ")}`
                                : "배정 없음"}
                        </Text>
                        <TouchableOpacity onPress={()=>onDelete(item.id)}>
                            <Text style={s.del}>삭제</Text>
                        </TouchableOpacity>
                    </View>
                )}
                ListEmptyComponent={<Text style={s.empty}>이 날짜의 근무 일정이 없습니다.</Text>}
                contentContainerStyle={{ paddingBottom: 16 }}
            />
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    form: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
    date: { fontSize: 16, fontWeight: "700" },
    row: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
    input: { flex: 1, borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 8, paddingHorizontal: 12, height: 42 },
    tilde: { paddingHorizontal: 4 },
    btn: { backgroundColor: "#4F46E5", paddingHorizontal: 14, height: 42, borderRadius: 8, justifyContent: "center" },
    btnText: { color: "#fff", fontWeight: "700" },
    item: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
    itemTime: { fontSize: 16, fontWeight: "700" },
    itemSub: { marginTop: 2, color: "#6B7280" },
    del: { color: "#EF4444", fontWeight: "700", marginTop: 6 },
    empty: { textAlign: "center", color: "#6B7280", marginTop: 24 },
    empRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    empChip: { borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
    empChipActive: { backgroundColor: "#4F46E5", borderColor: "#4F46E5" },
    empChipText: { color: "#111827" },
    empChipTextActive: { color: "#fff", fontWeight: "700" },
});
