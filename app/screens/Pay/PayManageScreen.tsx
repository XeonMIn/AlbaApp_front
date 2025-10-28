// app/screens/Pay/PayManageScreen.tsx
import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PayManageScreen({ navigation }: any) {
    const [payList] = useState([
        {
            id: "emp001",
            name: "김민수",
            role: "바리스타",
            totalHours: 42,
            hourlyWage: 12000,
            finalPay: 504000,
            status: "지급 예정",
        },
        {
            id: "emp002",
            name: "이서연",
            role: "매장관리",
            totalHours: 38,
            hourlyWage: 12000,
            finalPay: 456000,
            status: "지급 완료",
        },
        {
            id: "emp003",
            name: "박정우",
            role: "알바생",
            totalHours: 28,
            hourlyWage: 12000,
            finalPay: 336000,
            status: "지급 예정",
        },
    ]);

    return (
        <SafeAreaView style={s.container}>
            {/* 상단 헤더 */}
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={26} color="#111" />
                </TouchableOpacity>
                <Text style={s.title}>💰 급여 관리</Text>
                <View style={{ width: 26 }} />
            </View>

            {/* 급여 요약 */}
            <View style={s.summaryBox}>
                <Text style={s.summaryText}>총 직원 수: {payList.length}명</Text>
                <Text style={s.summaryText}>
                    지급 예정:{" "}
                    {payList.filter((p) => p.status === "지급 예정").length}명
                </Text>
            </View>

            {/* 직원 급여 리스트 */}
            <ScrollView contentContainerStyle={s.listContainer}>
                {payList.map((emp) => (
                    <TouchableOpacity
                        key={emp.id}
                        style={s.card}
                        onPress={() => navigation.navigate("PayDetail", { item: emp })}
                        activeOpacity={0.8}
                    >
                        <View style={s.rowBetween}>
                            <Text style={s.name}>{emp.name}</Text>
                            <Text
                                style={[
                                    s.status,
                                    emp.status === "지급 완료"
                                        ? { color: "green" }
                                        : { color: "#FF3B30" },
                                ]}
                            >
                                {emp.status}
                            </Text>
                        </View>
                        <Text style={s.role}>{emp.role}</Text>
                        <Text style={s.detail}>
                            근무시간: {emp.totalHours}시간 · 시급 ₩{emp.hourlyWage.toLocaleString()}
                        </Text>
                        <Text style={s.finalPay}>
                            급여액: ₩{emp.finalPay.toLocaleString()}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* 향후 확장 버튼 (예: 지급 확정, 엑셀 내보내기 등) */}
            <TouchableOpacity style={s.button}>
                <Ionicons name="cash-outline" size={20} color="#fff" />
                <Text style={s.buttonText}>급여 지급 처리</Text>
            </TouchableOpacity>
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
        paddingVertical: 10,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        elevation: 2,
    },
    title: { fontSize: 18, fontWeight: "bold", color: "#111" },
    summaryBox: {
        margin: 16,
        padding: 14,
        backgroundColor: "#fff",
        borderRadius: 12,
        elevation: 2,
    },
    summaryText: { fontSize: 15, color: "#111", marginBottom: 4 },
    listContainer: { paddingHorizontal: 16, paddingBottom: 100 },
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
        elevation: 2,
    },
    rowBetween: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    name: { fontSize: 16, fontWeight: "bold", color: "#111" },
    role: { color: "#555", marginBottom: 4 },
    detail: { color: "#333", fontSize: 14 },
    finalPay: { fontWeight: "bold", marginTop: 4, color: "#007AFF" },
    status: { fontWeight: "bold" },
    button: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#007AFF",
        padding: 16,
        borderRadius: 12,
        position: "absolute",
        bottom: 20,
        left: 16,
        right: 16,
        elevation: 3,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
        marginLeft: 6,
    },
});
