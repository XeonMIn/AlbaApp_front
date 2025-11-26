import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar } from "react-native-calendars";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import dayjs from "dayjs";
import { fetchShiftsByDate, fetchShiftsRange, type Shift } from "@/api/shift.api";
import { fetchMyEmployment, type EmploymentMemberDto } from "@/api/employment.api";

function hhmm(v: string) { const m = v.match(/^(\d{2}):(\d{2})/); return m ? `${m[1]}:${m[2]}` : v; }

export default function ScheduleScreen() {
    const { workplaceId } = useSelector((s: RootState) => s.user);
    const [selected, setSelected] = useState(dayjs().format("YYYY-MM-DD"));
    const [items, setItems] = useState<Shift[]>([]);
    const [marks, setMarks] = useState<any>({});
    const [meEmp, setMeEmp] = useState<EmploymentMemberDto | null>(null);

    useEffect(() => { if (workplaceId) fetchMyEmployment(workplaceId).then(setMeEmp).catch(()=>setMeEmp(null)); }, [workplaceId]);

    const monthKey = dayjs(selected).format("YYYY-MM");
    useEffect(() => {
        if (!workplaceId || !meEmp?.employmentId) return;
        const start = dayjs(selected).startOf("month").format("YYYY-MM-DD");
        const end = dayjs(selected).endOf("month").format("YYYY-MM-DD");
        fetchShiftsRange(workplaceId, start, end, { employmentId: meEmp.employmentId }).then(list => {
            const grouped = list.reduce<Record<string, number>>((acc, s) => {
                acc[s.workDate] = (acc[s.workDate] || 0) + 1; return acc;
            }, {});
            const m: any = {};
            Object.keys(grouped).forEach(d => { m[d] = { marked: true }; });
            m[selected] = { ...(m[selected] || {}), selected: true, selectedColor: "#10B981" };
            setMarks(m);
        }).catch(()=>{});
    }, [workplaceId, monthKey, selected, meEmp?.employmentId]);

    useEffect(() => {
        if (!workplaceId || !meEmp?.employmentId) return;
        fetchShiftsByDate(workplaceId, selected, { employmentId: meEmp.employmentId })
            .then(setItems)
            .catch(()=>setItems([]));
    }, [workplaceId, selected, meEmp?.employmentId]);

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
            <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
                <Text style={s.date}>{selected}</Text>
            </View>
            {!meEmp?.employmentId && (
                <Text style={{ textAlign: "center", color: "#6B7280" }}>내 고용 정보를 찾을 수 없습니다.</Text>
            )}
            <FlatList
                data={[...items].sort((a,b)=>a.startTime.localeCompare(b.startTime))}
                keyExtractor={(it)=>String(it.id)}
                renderItem={({ item }) => (
                    <View style={s.item}>
                        <Text style={s.time}>{hhmm(item.startTime)}~{hhmm(item.endTime)}</Text>
                    </View>
                )}
                ListEmptyComponent={<Text style={s.empty}>이 날짜에 배정된 근무가 없습니다.</Text>}
                contentContainerStyle={{ paddingBottom: 24 }}
            />
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    date: { fontSize: 16, fontWeight: "600" },
    item: { marginHorizontal: 16, marginBottom: 10, padding: 14, borderRadius: 10, borderWidth: 1, borderColor: "#E5E7EB", backgroundColor: "#F9FAFB" },
    time: { fontSize: 16, fontWeight: "700" },
    empty: { textAlign: "center", color: "#6B7280", marginTop: 12 }
});
