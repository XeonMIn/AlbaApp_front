import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
// @ts-ignore
import type { RootState } from "@/store";
import { fetchMyTasks, completeTask, type TaskAssignmentDto } from "@/api/task";

export default function EmployeeTasksScreen() {
    const user = useSelector((s: RootState) => s.user);
    const workplaceId = user?.workplaceId;
    const memberId = user?.id;

    const [items, setItems] = useState<TaskAssignmentDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async () => {
        if (!workplaceId || !memberId) return;
        setLoading(true);
        try {
            const data = await fetchMyTasks(workplaceId, memberId);
            setItems(data ?? []);
        } catch (e: any) {
            console.warn(e);
            Alert.alert("오류", e?.message || "업무 목록을 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    }, [workplaceId, memberId]);

    useEffect(() => { load(); }, [load]);

    const onRefresh = async () => {
        setRefreshing(true);
        await load();
        setRefreshing(false);
    };

    const onComplete = async (assignmentId: number) => {
        try {
            await completeTask(assignmentId, memberId!);
            await load();
        } catch (e: any) {
            Alert.alert("오류", e?.message || "완료 처리 중 오류가 발생했습니다.");
        }
    };

    const renderItem = ({ item }: { item: TaskAssignmentDto }) => {
        const done = item.status === "DONE";
        const title = item.taskName || (item.taskId ? `업무 #${item.taskId}` : "업무");
        const assignee = item.memberName || ""; // 자신 이름(백에서 내려준 값)

        return (
            <View style={[s.card, done && { opacity: 0.6 }]}>
                <View style={s.row}>
                    <Text style={s.title}>{title}</Text>
                    <Text style={[s.badge, done ? s.badgeDone : s.badgeAssigned]}>{done ? "완료" : "할당"}</Text>
                </View>
                <Text style={s.sub}>담당: {assignee || "(이름없음)"}</Text>
                <View style={s.actions}>
                    {!done ? (
                        <TouchableOpacity style={s.btn} onPress={() => onComplete(item.id)}>
                            <Ionicons name="checkmark-done-outline" size={18} color="#fff" />
                            <Text style={s.btnText}>완료</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={s.donePill}>
                            <Ionicons name="checkmark-done" size={16} color="#2ecc71" />
                            <Text style={s.doneText}>완료됨</Text>
                        </View>
                    )}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={s.safe} edges={["top", "left", "right"]}>
            <View style={s.header}>
                <Text style={s.headerTitle}>내 업무</Text>
                <TouchableOpacity onPress={load}>
                    <Ionicons name="refresh-outline" size={22} color="#111" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={items}
                keyExtractor={(it) => String(it.id)}
                renderItem={renderItem}
                contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
                ListEmptyComponent={!loading ? <Text style={s.empty}>배정된 업무가 없습니다.</Text> : null}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            />
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "#fff" },
    header: {
        paddingTop: 6, paddingBottom: 8, paddingHorizontal: 16,
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    },
    headerTitle: { fontSize: 20, fontWeight: "700", color: "#111" },
    empty: { textAlign: "center", color: "#999", marginTop: 48 },
    card: {
        backgroundColor: "#fafafa", borderRadius: 12, padding: 16, marginBottom: 12,
        borderWidth: 1, borderColor: "#eee",
    },
    row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    title: { fontSize: 16, fontWeight: "700", color: "#222" },
    sub: { marginTop: 6, color: "#555" },
    badge: {
        paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, overflow: "hidden",
        fontSize: 12, fontWeight: "700",
    },
    badgeAssigned: { backgroundColor: "#f0f0f0", color: "#444" },
    badgeDone: { backgroundColor: "#e8fbef", color: "#2ecc71" },
    actions: { marginTop: 10, flexDirection: "row", gap: 12, alignItems: "center" },
    btn: { flexDirection: "row", gap: 6, backgroundColor: "#111", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
    btnText: { color: "#fff", fontWeight: "600" },
    donePill: { flexDirection: "row", alignItems: "center", gap: 6 },
    doneText: { color: "#2ecc71", fontWeight: "700" },
});
