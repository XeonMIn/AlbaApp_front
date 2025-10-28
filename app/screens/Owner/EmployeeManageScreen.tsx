// app/screens/Owner/EmployeeManageScreen.tsx
import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Modal,
    TextInput,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

type Employee = {
    id: string;
    name: string;
    role: string;
    wage: number;
    status: "출근" | "퇴근";
};

export default function EmployeeManageScreen({ navigation }: any) {
    const [employees, setEmployees] = useState<Employee[]>([
        { id: "1", name: "테스트 계정 1", role: "매니저", wage: 12000, status: "출근" },
        { id: "2", name: "테스트 계정 2", role: "직원", wage: 11000, status: "퇴근" },
        { id: "3", name: "테스트 계정 3", role: "직원", wage: 13000, status: "출근" },
    ]);

    // 모달 상태 관리
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [newRole, setNewRole] = useState("");
    const [newWage, setNewWage] = useState("");

    // 수정 버튼 클릭
    const handleEdit = (employee: Employee) => {
        setSelectedEmployee(employee);
        setNewRole(employee.role);
        setNewWage(employee.wage.toString());
        setEditModalVisible(true);
    };

    // 수정 저장
    const handleSave = () => {
        if (!newRole || !newWage) {
            Alert.alert("입력 오류", "직급과 시급을 모두 입력해주세요.");
            return;
        }

        setEmployees((prev) =>
            prev.map((emp) =>
                emp.id === selectedEmployee?.id
                    ? { ...emp, role: newRole, wage: parseInt(newWage) }
                    : emp
            )
        );
        setEditModalVisible(false);
    };

    // 삭제 버튼
    const handleDelete = (id: string) => {
        Alert.alert("삭제 확인", "정말 이 직원을 삭제하시겠습니까?", [
            { text: "취소", style: "cancel" },
            {
                text: "삭제",
                style: "destructive",
                onPress: () =>
                    setEmployees((prev) => prev.filter((emp) => emp.id !== id)),
            },
        ]);
    };

    return (
        <SafeAreaView style={s.container}>
            {/* 상단 헤더 */}
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={26} color="#111" />
                </TouchableOpacity>
                <Text style={s.title}>직원 관리</Text>
                <TouchableOpacity onPress={() => alert("직원 추가 기능은 추후 구현 예정")}>
                    <Ionicons name="person-add-outline" size={24} color="#007AFF" />
                </TouchableOpacity>
            </View>

            {/* 직원 리스트 */}
            <ScrollView contentContainerStyle={{ padding: 16 }}>
                {employees.map((emp) => (
                    <View key={emp.id} style={s.card}>
                        <View style={s.rowBetween}>
                            <View>
                                <Text style={s.name}>{emp.name}</Text>
                                <Text style={s.sub}>
                                    {emp.role} · ₩{emp.wage.toLocaleString()}
                                </Text>
                            </View>
                            <View style={s.rowRight}>
                                <Text
                                    style={[
                                        s.status,
                                        emp.status === "출근"
                                            ? { color: "green" }
                                            : { color: "#999" },
                                    ]}
                                >
                                    {emp.status}
                                </Text>
                                <TouchableOpacity onPress={() => handleEdit(emp)}>
                                    <Ionicons
                                        name="create-outline"
                                        size={22}
                                        color="#007AFF"
                                        style={{ marginLeft: 10 }}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleDelete(emp.id)}>
                                    <Ionicons
                                        name="trash-outline"
                                        size={22}
                                        color="#FF3B30"
                                        style={{ marginLeft: 10 }}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                ))}
            </ScrollView>

            {/* 수정 모달 */}
            <Modal visible={editModalVisible} transparent animationType="fade">
                <View style={s.modalOverlay}>
                    <View style={s.modalContainer}>
                        <Text style={s.modalTitle}>
                            {selectedEmployee?.name} 정보 수정
                        </Text>

                        <TextInput
                            style={s.input}
                            placeholder="직급 입력 (예: 매니저)"
                            value={newRole}
                            onChangeText={setNewRole}
                        />
                        <TextInput
                            style={s.input}
                            placeholder="시급 입력 (예: 12000)"
                            keyboardType="numeric"
                            value={newWage}
                            onChangeText={setNewWage}
                        />

                        <View style={s.modalButtons}>
                            <TouchableOpacity
                                style={[s.modalButton, { backgroundColor: "#007AFF" }]}
                                onPress={handleSave}
                            >
                                <Text style={s.modalButtonText}>저장</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[s.modalButton, { backgroundColor: "#ccc" }]}
                                onPress={() => setEditModalVisible(false)}
                            >
                                <Text style={s.modalButtonText}>취소</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f8f9fb" },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        elevation: 2,
    },
    title: { fontSize: 18, fontWeight: "bold", color: "#111" },
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
    },
    rowBetween: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    rowRight: { flexDirection: "row", alignItems: "center" },
    name: { fontSize: 16, fontWeight: "bold", color: "#111" },
    sub: { color: "#555", marginTop: 4 },
    status: { fontSize: 14, fontWeight: "bold", marginRight: 6 },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 20,
        width: "85%",
        elevation: 5,
    },
    modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 14 },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
    },
    modalButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10,
    },
    modalButton: {
        flex: 1,
        padding: 10,
        marginHorizontal: 4,
        borderRadius: 8,
        alignItems: "center",
    },
    modalButtonText: { color: "#fff", fontWeight: "bold" },
});
