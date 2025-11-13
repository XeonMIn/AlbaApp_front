import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
// @ts-ignore
import type { RootState } from "@/store";

export default function OwnerHomeScreen({ navigation }: any) {
    const user = useSelector((state: RootState) => state.user);
    return (
        <SafeAreaView style={s.container}>
            {/* 상단 헤더 */}
            <View style={s.header}>
                <Text style={s.title}>{user.name ? `${user.name}님 홈` : "사장님 홈"}</Text>
                <TouchableOpacity onPress={() => navigation.navigate("OwnerNotice")}>
                    <Ionicons name="notifications-outline" size={26} color="#111" />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {/* 매장 정보 */}
                <TouchableOpacity style={s.card} onPress={() => navigation.navigate("WorkplaceInfo")}>
                    <Text style={s.cardTitle}>📍 내 매장</Text>
                    <Text style={s.cardMain}>스마트커피 홍대점</Text>
                    <Text style={s.cardSub}>서울 마포구 양화로 45길 12</Text>
                </TouchableOpacity>

                {/* 요약 정보 (직원 수 / 출근 인원) */}
                <View style={s.row}>
                    <TouchableOpacity
                        style={[s.infoBox, { backgroundColor: "#007AFF" }]}
                        onPress={() => navigation.navigate("EmployeeManage")}
                    >
                        <Ionicons name="people-outline" size={28} color="#fff" />
                        <Text style={s.infoLabel}>직원 수</Text>
                        <Text style={s.infoValue}>3명</Text>
                    </TouchableOpacity>

                    <View style={[s.infoBox, { backgroundColor: "#34C759" }]}>
                        <Ionicons name="checkmark-done-outline" size={28} color="#fff" />
                        <Text style={s.infoLabel}>출근 인원</Text>
                        <Text style={s.infoValue}>2명</Text>
                    </View>
                </View>

                {/* ✅ 급여 관리 카드 추가 */}
                <TouchableOpacity
                    style={s.payCard}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate("PayManage")}
                >
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Ionicons name="cash-outline" size={26} color="#007AFF" />
                        <Text style={s.payTitle}>급여 관리</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={22} color="#aaa" />
                </TouchableOpacity>

                {/* ✅ 업무 관리 카드 */}
                <TouchableOpacity
                    style={s.taskCard}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate("OwnerTask")}
                >
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Ionicons name="clipboard-outline" size={24} color="#007AFF" />
                        <Text style={s.taskTitle}>업무 관리</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={22} color="#aaa" />
                </TouchableOpacity>

                {/* 근무 일정 */}
                <View style={s.section}>
                    <Text style={s.sectionTitle}>🗓️ 오늘 근무 일정</Text>
                    <TouchableOpacity
                        style={s.sectionCard}
                        onPress={() => navigation.navigate("OwnerSchedule")}
                    >
                        <Text style={s.cardText}>오전 9시 ~ 오후 6시</Text>
                        <Text style={s.cardSubText}>직원 5명 근무 중</Text>
                    </TouchableOpacity>
                </View>


                {/* 공지사항 */}
                <View style={s.section}>
                    <Text style={s.sectionTitle}>📢 최근 공지사항</Text>
                    <TouchableOpacity
                        style={s.noticeCard}
                        onPress={() => navigation.navigate("OwnerNotice")}
                    >
                        <Ionicons name="alert-circle" size={18} color="red" />
                        <Text style={s.noticeText}>이번 주 주말 휴무 안내</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={s.noticeCard}
                        onPress={() => navigation.navigate("OwnerNotice")}
                    >
                        <Ionicons name="megaphone-outline" size={18} color="#007AFF" />
                        <Text style={s.noticeText}>11월 유니폼 변경 공지</Text>
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
    title: { fontSize: 22, fontWeight: "bold", color: "#111" },

    card: {
        backgroundColor: "#fff",
        margin: 16,
        borderRadius: 16,
        padding: 20,
        elevation: 3,
    },
    cardTitle: { fontSize: 16, color: "#666" },
    cardMain: { fontSize: 22, fontWeight: "bold", marginVertical: 6, color: "#111" },
    cardSub: { fontSize: 14, color: "#777" },

    row: { flexDirection: "row", justifyContent: "space-around", marginTop: 10 },
    infoBox: {
        flex: 1,
        marginHorizontal: 8,
        borderRadius: 16,
        padding: 20,
        alignItems: "center",
    },
    infoLabel: { color: "#fff", marginTop: 6, fontSize: 14 },
    infoValue: { color: "#fff", fontSize: 18, fontWeight: "bold" },

    // ✅ 급여 관리 카드 스타일
    payCard: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginTop: 20,
        elevation: 2,
    },
    payTitle: { fontSize: 16, fontWeight: "bold", color: "#111", marginLeft: 8 },

    section: { marginHorizontal: 16, marginTop: 24 },
    sectionTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },
    sectionCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 14,
        elevation: 2,
    },
    cardText: { fontSize: 15, fontWeight: "600" },
    cardSubText: { color: "#555", marginTop: 4, fontSize: 13 },

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

    taskCard: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginTop: 20,
        elevation: 2,
    },
    taskTitle: { fontSize: 16, fontWeight: "bold", color: "#111", marginLeft: 8 },

});
