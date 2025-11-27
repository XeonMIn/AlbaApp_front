// app/screens/Owner/EmployeeManagementScreen.tsx
import React, { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { fetchEmploymentList, type EmploymentMemberDto } from "@/api/employment.api";

type EmployeeItem = {
    id: number;
    name: string;
    roleLabel: string; // UI 표기 (일단 “직원” 고정)
    hourlyWage?: number | null;
    status?: "출근" | "퇴근";
};

export default function EmployeeManagementScreen({ navigation }: any) {
    const user = useSelector((state: RootState) => state.user);
    const workplaceId = user.workplaceId ?? 0;

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [employees, setEmployees] = useState<EmployeeItem[]>([]);

    /** 직원 목록 불러오기 */
    const loadEmployees = useCallback(async () => {
        try {
            setLoading(true);
            const rows: EmploymentMemberDto[] = await fetchEmploymentList(workplaceId);

            const list: EmployeeItem[] = rows.map((m) => ({
                id: m.memberId,
                name: m.memberName,
                roleLabel: "직원",
            }));

            setEmployees(list);
        } catch (err) {
            console.error("직원 목록 불러오기 오류:", err);
        } finally {
            setLoading(false);
        }
    }, [workplaceId]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await loadEmployees();
        } finally {
            setRefreshing(false);
        }
    }, [loadEmployees]);

    useEffect(() => {
        loadEmployees();
    }, [loadEmployees]);

    return (
        <SafeAreaView style={s.container}>
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={24} color="#111" />
                </TouchableOpacity>
                <Text style={s.title}>직원 관리</Text>
                {/* 읽기 전용: 우측 액션 제거 */}
                <View style={{ width: 24 }} />
            </View>

            {loading ? (
                <View style={s.loadingBox}>
                    <ActivityIndicator size="large" />
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={{ padding: 16 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                >
                    {employees.length === 0 ? (
                        <View style={s.emptyBox}>
                            <Ionicons name="people-outline" size={32} color="#999" />
                            <Text style={s.emptyText}>등록된 직원이 없습니다.</Text>
                        </View>
                    ) : (
                        employees.map((emp) => (
                            <View key={emp.id} style={s.card}>
                                <View style={{ flex: 1 }}>
                                    <Text style={s.name}>{emp.name}</Text>
                                    <Text style={s.sub}>{emp.roleLabel}</Text>
                                </View>
                                {/* 읽기 전용: 상태만 표시(있을 때) */}
                                {!!emp.status && (
                                    <Text style={emp.status === "출근" ? s.onWork : s.offWork}>{emp.status}</Text>
                                )}
                            </View>
                        ))
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f7f7f7" },
    header: {
        height: 50,
        backgroundColor: "#fff",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#ddd",
    },
    title: { fontSize: 18, fontWeight: "700" },
    loadingBox: { flex: 1, justifyContent: "center", alignItems: "center" },
    card: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: "#eee",
    },
    name: { fontSize: 16, fontWeight: "700", color: "#111" },
    sub: { fontSize: 13, color: "#666", marginTop: 4 },
    onWork: { color: "green", fontWeight: "700", marginLeft: 8 },
    offWork: { color: "#999", fontWeight: "700", marginLeft: 8 },
    emptyBox: {
        paddingVertical: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    emptyText: { marginTop: 8, color: "#999" },
});
