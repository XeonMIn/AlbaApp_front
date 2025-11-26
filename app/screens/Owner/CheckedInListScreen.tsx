import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { getTodayCheckedInList, type CheckedInMemberDto } from "@/api/attendance.api";

function fmt(t?: string) {
    if (!t) return "";
    const d = new Date(t);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
}

export default function CheckedInListScreen() {
    const { workplaceId } = useSelector((s: RootState) => s.user);
    const [loading, setLoading] = useState(false);
    const [list, setList] = useState<CheckedInMemberDto[]>([]);

    useEffect(() => {
        (async () => {
            if (!workplaceId) { setList([]); return; }
            try {
                setLoading(true);
                const res = await getTodayCheckedInList(workplaceId);
                setList(res);
            } finally {
                setLoading(false);
            }
        })();
    }, [workplaceId]);

    if (!workplaceId) {
        return (
            <View style={s.center}><Text>대표 매장을 먼저 선택해주세요.</Text></View>
        );
    }

    return (
        <View style={s.container}>
            {loading ? (
                <View style={s.center}><ActivityIndicator /></View>
            ) : list.length === 0 ? (
                <View style={s.center}><Text>현재 출근 중인 인원이 없습니다.</Text></View>
            ) : (
                <FlatList
                    data={list}
                    keyExtractor={(x) => String(x.memberId)}
                    renderItem={({ item }) => (
                        <View style={s.row}>
                            <Text style={s.name}>{item.memberName ?? "직원"}</Text>
                            <Text style={s.time}>{fmt(item.checkInAt)} 출근</Text>
                        </View>
                    )}
                    ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                    contentContainerStyle={{ padding: 16 }}
                />
            )}
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f8f9fb" },
    center: { flex: 1, alignItems: "center", justifyContent: "center" },
    row: { backgroundColor: "#fff", borderRadius: 12, padding: 16, elevation: 2, flexDirection: "row", justifyContent: "space-between" },
    name: { fontSize: 16, fontWeight: "bold", color: "#111" },
    time: { fontSize: 14, color: "#555" },
});
