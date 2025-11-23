// app/screens/Owner/OwnerTasksScreen.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Alert, RefreshControl, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
// @ts-ignore
import type { RootState } from "@/store";
import { assignTask, createTask, fetchWorkplaceTasks, deleteTask, type TaskCard } from "@/api/task";
import { fetchEmploymentLookup } from "@/api/employment";

type EmployeeOption = { employmentId: number; name: string };

const TaskItem: React.FC<{
    item: TaskCard;
    employees: EmployeeOption[];
    onAssignByEmploymentId: (taskId: number, employmentId: number) => Promise<void>;
    onDelete: (taskId: number) => Promise<void>;
}> = ({ item, employees, onAssignByEmploymentId, onDelete }) => {
    const [query, setQuery] = useState("");
    const [picked, setPicked] = useState<EmployeeOption | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const suggestions = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return employees.slice(0, 6);
        return employees.filter(e => (e.name || "").toLowerCase().includes(q)).slice(0, 6);
    }, [employees, query]);

    const assign = async () => {
        if (!picked?.employmentId) {
            Alert.alert("확인", "알바 이름을 선택해 주세요.");
            return;
        }
        try {
            setSubmitting(true);
            await onAssignByEmploymentId(item.id, picked.employmentId);
        } catch (e: any) {
            const msg = e?.response?.data?.message || e?.message || "업무 배정에 실패했습니다.";
            Alert.alert("오류", msg);
        } finally {
            setSubmitting(false);
        }
    };

    const confirmDelete = () => {
        Alert.alert("삭제 확인", "해당 업무를 삭제하시겠습니까?", [
            { text: "취소", style: "cancel" },
            { text: "삭제", style: "destructive", onPress: async () => await onDelete(item.id) },
        ]);
    };

    const assigned = item.assigned;
    const assignee = item.assigneeName ?? "";
    const status: "ASSIGNED" | "DONE" | undefined = (item as any).status; // 백엔드/타입에 상태가 포함된 경우 표시

    return (
        <View style={s.card}>
            {/* 상단: 이름만 표시(# 제거) + 상태 배지 + 삭제 */}
            <View style={s.row}>
                <Text style={s.name} numberOfLines={1}>{item.name}</Text>

                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    {assigned && (
                        <Text style={[s.badge, status === "DONE" ? s.badgeDone : s.badgeAssigned]}>
                            {status === "DONE" ? "완료" : "배정됨"}
                        </Text>
                    )}
                    <TouchableOpacity style={s.iconBtn} onPress={confirmDelete}>
                        <Ionicons name="trash-outline" size={18} color="#e53935" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* 배정 상태 표시(미배정 안내) */}
            <View style={{ marginTop: 8 }}>
                {assigned ? (
                    <Text style={s.assignedText}>
                        담당: <Text style={s.assignee}>{assignee || "(이름없음)"}</Text>
                    </Text>
                ) : (
                    <Text style={s.pendingText}>담당자 미배정</Text>
                )}
            </View>

            {/* 배정 UI: 배정된 경우 전부 비활성 */}
            <View style={{ marginTop: 10, gap: 8 }}>
                <TextInput
                    value={assigned ? assignee : (picked?.name ?? "") || query}
                    onChangeText={(t) => { if (!assigned) { setQuery(t); setPicked(null); } }}
                    placeholder="알바 이름 검색"
                    style={[s.input, assigned && s.disabled]}
                    editable={!assigned}
                    autoCorrect={false}
                    autoCapitalize="none"
                />

                {!assigned && (
                    <ScrollView style={s.suggestBox} keyboardShouldPersistTaps="handled">
                        {suggestions.length === 0 ? (
                            <Text style={s.suggestEmpty}>검색 결과가 없습니다.</Text>
                        ) : suggestions.map(opt => (
                            <TouchableOpacity
                                key={opt.employmentId}
                                style={[s.suggestItem, picked?.employmentId === opt.employmentId && s.suggestPicked]}
                                onPress={() => { setPicked(opt); setQuery(opt.name); }}
                            >
                                <Ionicons name="person-circle-outline" size={18} color="#111" />
                                <Text style={s.suggestText}>{opt.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}

                <TouchableOpacity
                    style={[s.btn, (assigned || !picked || submitting) && { opacity: 0.4 }]}
                    onPress={assign}
                    disabled={assigned || !picked || submitting}
                >
                    <Ionicons name="person-add-outline" size={18} color="#fff" />
                    <Text style={s.btnText}>{assigned ? "배정 완료" : (submitting ? "배정중..." : "배정")}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default function OwnerTasksScreen() {
    const user = useSelector((s: RootState) => s.user);
    const workplaceId = user?.workplaceId;

    const [name, setName] = useState("");
    const [list, setList] = useState<TaskCard[]>([]);
    const [employees, setEmployees] = useState<EmployeeOption[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async () => {
        if (!workplaceId) return;
        const [tasks, lookup] = await Promise.all([
            fetchWorkplaceTasks(workplaceId),
            fetchEmploymentLookup(workplaceId), // 알바만
        ]);
        setList(tasks ?? []);
        const opts: EmployeeOption[] = (lookup ?? [])
            .map(e => ({ employmentId: Number(e.employmentId), name: e.memberName ?? "(이름없음)" }))
            .filter((v, i, arr) => arr.findIndex(x => x.employmentId === v.employmentId) === i)
            .sort((a, b) => a.name.localeCompare(b.name, "ko"));
        setEmployees(opts);
    }, [workplaceId]);

    useEffect(() => { load(); }, [load]);

    const onCreate = async () => {
        if (!name.trim() || !workplaceId) return;
        await createTask({ workplaceId, name: name.trim() });
        setName("");
        await load();
    };

    const onAssignByEmploymentId = async (taskId: number, employmentId: number) => {
        await assignTask({ taskId, employmentId }); // 서버가 이미 중복 배정/사장 제외 검증
        await load();
    };

    const onDelete = async (taskId: number) => {
        await deleteTask(taskId);
        await load();
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await load();
        setRefreshing(false);
    };

    return (
        <SafeAreaView style={s.safe} edges={["top", "left", "right"]}>
            <View style={s.header}>
                <Text style={s.headerTitle}>업무 관리</Text>
            </View>

            <View style={s.form}>
                <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="업무 이름"
                    style={s.input}
                />
                <TouchableOpacity style={s.btn} onPress={onCreate}>
                    <Ionicons name="add-circle-outline" size={18} color="#fff" />
                    <Text style={s.btnText}>업무 생성</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={list}
                keyExtractor={(it) => String(it.id)}
                renderItem={({ item }) => (
                    <TaskItem
                        item={item}
                        employees={employees}
                        onAssignByEmploymentId={onAssignByEmploymentId}
                        onDelete={onDelete}
                    />
                )}
                contentContainerStyle={{ padding: 16, paddingBottom: 140 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={<Text style={s.empty}>등록된 업무가 없습니다.</Text>}
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

    form: { paddingHorizontal: 16, paddingVertical: 12, gap: 8, flexDirection: "row" },
    input: {
        flex: 1, height: 42, borderWidth: 1, borderColor: "#ddd",
        borderRadius: 10, paddingHorizontal: 12, backgroundColor: "#fafafa"
    },
    disabled: { backgroundColor: "#f1f1f1", color: "#999" },
    btn: {
        flexDirection: "row", alignItems: "center", gap: 6,
        backgroundColor: "#111", paddingHorizontal: 12, borderRadius: 10, height: 42
    },
    btnText: { color: "#fff", fontWeight: "700" },

    empty: { textAlign: "center", color: "#999", marginTop: 20 },
    card: {
        backgroundColor: "#fafafa", borderRadius: 12, padding: 16, marginBottom: 12,
        borderWidth: 1, borderColor: "#eee",
    },
    row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },

    // 제목(# 제거)
    name: { fontSize: 16, fontWeight: "700", color: "#222", flexShrink: 1 },

    iconBtn: { padding: 6 },

    // 상태 표시
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, fontSize: 12, fontWeight: "700" },
    badgeAssigned: { backgroundColor: "#f0f0f0", color: "#444" },
    badgeDone: { backgroundColor: "#e8fbef", color: "#2ecc71" },

    assignedText: { color: "#222", fontWeight: "600" },
    assignee: { color: "#007AFF" },
    pendingText: { color: "#888" },

    // 추천 목록
    suggestBox: {
        maxHeight: 140, borderWidth: 1, borderColor: "#eee",
        borderRadius: 10, backgroundColor: "#fff",
    },
    suggestItem: {
        flexDirection: "row", alignItems: "center", gap: 8,
        paddingHorizontal: 10, paddingVertical: 10,
        borderBottomWidth: 1, borderBottomColor: "#f5f5f5",
    },
    suggestPicked: { backgroundColor: "#f6faff" },
    suggestText: { color: "#111", fontWeight: "600" },
    suggestEmpty: { padding: 10, color: "#999" },
});
