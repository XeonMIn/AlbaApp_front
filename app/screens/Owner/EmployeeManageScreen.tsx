// app/screens/Owner/EmployeeManagementScreen.tsx
import React, { useEffect, useState, useCallback } from "react";
import {
    View, Text, TouchableOpacity, StyleSheet,
    ScrollView, ActivityIndicator, Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { fetchEmploymentList, type EmploymentMemberDto } from "@/api/employment.api";

type EmployeeItem = {
    id: number;
    name: string;
    roleLabel: string;          // UI용(일단 “직원” 고정)
    hourlyWage?: number | null; // DTO에 없으므로 옵션
    status?: "출근" | "퇴근";    // DTO에 없으므로 옵션
};

export default function EmployeeManagementScreen({ navigation }: any) {
    const user = useSelector((state: RootState) => state.user);
    const workplaceId = user.workplaceId ?? 0;

    const [loading, setLoading] = useState(true);
    const [employees, setEmployees] = useState<EmployeeItem[]>([]);

    /** 직원 목록 불러오기 */
    const loadEmployees = useCallback(async () => {
        try {
            setLoading(true);
            const rows: EmploymentMemberDto[] = await fetchEmploymentList(workplaceId);

            const list: EmployeeItem[] = rows.map((m) => ({
                id: m.memberId,
                name: m.memberName,
                roleLabel: "직원",      // 현재 DTO엔 role 없음 → 일단 “직원”
                // hourlyWage/status는 다른 API 붙일 때 채움
            }));

            setEmployees(list);
        } catch (err) {
            console.error("직원 목록 불러오기 오류:", err);
            Alert.alert("오류", "직원 목록을 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    }, [workplaceId]);

    useEffect(() => { loadEmployees(); }, [loadEmployees]);

    return (
        <SafeAreaView style={s.container}>
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={24} color="#111" />
                </TouchableOpacity>
                <Text style={s.title}>직원 관리</Text>
                <TouchableOpacity onPress={() => navigation.navigate("AddEmployee")}>
                    <Ionicons name="add-circle-outline" size={28} color="#007AFF" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={s.loadingBox}>
                    <ActivityIndicator size="large" color="#007AFF" />
                </View>
            ) : (
                <ScrollView contentContainerStyle={{ padding: 16 }}>
                    {employees.map((emp) => (
                        <View key={emp.id} style={s.card}>
                            <View style={{ flex: 1 }}>
                                <Text style={s.name}>{emp.name}</Text>
                                <Text style={s.sub}>
                                    {emp.roleLabel}
                                    {typeof emp.hourlyWage === "number" ? ` · ₩${emp.hourlyWage.toLocaleString()}` : ""}
                                </Text>
                            </View>

                            {!!emp.status && (
                                <Text style={emp.status === "출근" ? s.onWork : s.offWork}>{emp.status}</Text>
                            )}

                            <TouchableOpacity onPress={() => navigation.navigate("EditEmployee", { employeeId: emp.id })}>
                                <Ionicons name="create-outline" size={22} color="#007AFF" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => Alert.alert("삭제", "삭제 기능 구현 예정")}
                                style={{ marginLeft: 12 }}
                            >
                                <Ionicons name="trash-outline" size={22} color="#FF3B30" />
                            </TouchableOpacity>
                        </View>
                    ))}
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
    onWork: { color: "green", fontWeight: "700", marginRight: 12 },
    offWork: { color: "#999", fontWeight: "700", marginRight: 12 },
});
