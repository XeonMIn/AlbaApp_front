// app/screens/Pay/PayListScreen.tsx
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PayListScreen({ navigation }: any) {
    const [payList] = useState([
        {
            id: "1",
            period: "2025년 10월",
            totalHours: 42,
            hourlyWage: 12000,
            regularPay: 504000,
            bonus: 8900,
            finalPay: 512900,
            status: "지급 예정",
        },
        {
            id: "2",
            period: "2025년 9월",
            totalHours: 40,
            hourlyWage: 12000,
            regularPay: 480000,
            bonus: 0,
            finalPay: 480000,
            status: "지급 완료",
        },
    ]);

    return (
        <SafeAreaView style={s.container}>
            {/* 헤더 */}
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={26} color="#111" />
                </TouchableOpacity>
                <Text style={s.title}>💰 급여 내역</Text>
                <View style={{ width: 26 }} />
            </View>

            {/* 급여 리스트 */}
            <ScrollView contentContainerStyle={s.content}>
                {payList.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        style={s.card}
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate("PayDetail", { item })}
                    >
                        <Text style={s.period}>{item.period}</Text>
                        <Text style={s.detail}>근무시간: {item.totalHours}시간</Text>
                        <Text style={s.detail}>
                            시급: ₩{item.hourlyWage.toLocaleString()}
                        </Text>
                        <Text style={s.finalPay}>
                            총지급액: ₩{item.finalPay.toLocaleString()}
                        </Text>
                        <Text style={s.status}>{item.status}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
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
    content: { padding: 16 },
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
    },
    period: { fontSize: 16, fontWeight: "bold", marginBottom: 8 },
    detail: { fontSize: 14, color: "#333", marginBottom: 2 },
    finalPay: { fontSize: 15, fontWeight: "bold", color: "#007AFF", marginTop: 4 },
    status: { fontSize: 13, color: "#888", marginTop: 4 },
});
