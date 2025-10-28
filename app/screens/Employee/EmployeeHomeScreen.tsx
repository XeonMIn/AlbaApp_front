// app/screens/Employee/EmployeeHomeScreen.tsx
import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EmployeeHomeScreen({ navigation }: any) {
    return (
        <SafeAreaView style={s.container}>
            {/* 상단 헤더 */}
            <View style={s.header}>
                <Text style={s.name}>선민님</Text>
                <TouchableOpacity onPress={() => navigation.navigate("Notice")}>
                    <Ionicons name="notifications-outline" size={26} color="#111" />
                </TouchableOpacity>
            </View>

            {/* 본문 스크롤 영역 */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

                {/* ✅ 급여 카드 (클릭 가능하도록 수정) */}
                <TouchableOpacity
                    style={s.salaryCard}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate("PayList")}
                >
                    <Text style={s.salaryLabel}>이번 달 예상 급여</Text>
                    <Text style={s.salaryAmount}>₩ 512,900</Text>
                    <Text style={s.salarySub}>근무 42시간 · 시급 ₩12,000</Text>
                </TouchableOpacity>

                {/* 출퇴근 카드 */}
                <View style={s.attendanceCard}>
                    <TouchableOpacity style={{ alignItems: "center" }} onPress={() => alert("QR 출퇴근 기능 준비중")}>
                        <Ionicons name="qr-code-outline" size={40} color="#007AFF" />
                        <Text style={s.subText}>QR 출퇴근</Text>
                    </TouchableOpacity>

                    <View style={s.verticalDivider}></View>

                    <View style={{ alignItems: "center" }}>
                        <Ionicons name="walk-outline" size={40} color="green" />
                        <Text style={[s.subText, { color: "green" }]}>출근 완료</Text>
                    </View>
                </View>

                {/* 오늘 일정 */}
                <View style={s.section}>
                    <Text style={s.sectionTitle}>📅 오늘 근무 일정</Text>
                    <TouchableOpacity style={s.card} onPress={() => navigation.navigate("Schedule")}>
                        <Text style={s.cardText}>10:00 ~ 18:00 (8시간)</Text>
                        <Text style={s.cardSub}>매장명: 스마트커피</Text>
                    </TouchableOpacity>
                </View>

                {/* 업무 체크리스트 */}
                <View style={s.section}>
                    <Text style={s.sectionTitle}>✅ 오늘의 업무</Text>
                    <TouchableOpacity style={s.taskCard} onPress={() => navigation.navigate("Task")}>
                        <Text style={s.taskItem}>☑️ 매장 청소</Text>
                        <Text style={s.taskItem}>☑️ 냉장고 정리</Text>
                        <Text style={s.taskItem}>☐ 재고 확인</Text>
                    </TouchableOpacity>
                </View>

                {/* 공지사항 */}
                <View style={s.section}>
                    <Text style={s.sectionTitle}>📢 최근 공지사항</Text>
                    <TouchableOpacity style={s.noticeCard} onPress={() => navigation.navigate("Notice")}>
                        <Ionicons name="alert-circle" size={18} color="red" />
                        <Text style={s.noticeText}>이번 주 주말 휴무 안내</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.noticeCard} onPress={() => navigation.navigate("Notice")}>
                        <Ionicons name="alert-circle" size={18} color="orange" />
                        <Text style={s.noticeText}>유니폼 변경 예정 (5월부터)</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f8f9fb" },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 14,
        backgroundColor: "#fff",
        elevation: 3,
    },
    name: { fontSize: 22, fontWeight: "bold", color: "#111" },

    // ✅ 급여 카드 스타일
    salaryCard: {
        margin: 16,
        borderRadius: 18,
        padding: 20,
        elevation: 3,
        backgroundColor: "#007AFF",
    },
    salaryLabel: { color: "#fff", fontSize: 14 },
    salaryAmount: { color: "#fff", fontSize: 32, fontWeight: "bold", marginTop: 6 },
    salarySub: { color: "#eef", fontSize: 13, marginTop: 4 },

    attendanceCard: {
        flexDirection: "row",
        justifyContent: "space-around",
        backgroundColor: "#fff",
        marginHorizontal: 16,
        padding: 20,
        borderRadius: 16,
        elevation: 2,
    },
    verticalDivider: { width: 1, backgroundColor: "#ddd", height: "100%" },
    section: { marginHorizontal: 16, marginTop: 20 },
    sectionTitle: { fontWeight: "bold", fontSize: 16, marginBottom: 10 },
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 14,
        elevation: 2,
    },
    cardText: { fontSize: 15, fontWeight: "600" },
    cardSub: { color: "#555", marginTop: 4, fontSize: 13 },
    taskCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 14,
        elevation: 2,
    },
    taskItem: { fontSize: 14, marginBottom: 6 },
    noticeCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 10,
        marginBottom: 8,
        elevation: 1,
    },
    noticeText: { marginLeft: 8, color: "#333", fontSize: 13 },
    subText: { marginTop: 4, fontSize: 13, color: "#333" },
});
