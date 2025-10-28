// app/screens/Pay/PayDetailScreen.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PayDetailScreen({ route, navigation }: any) {
    const { item } = route.params;

    return (
        <SafeAreaView style={s.container}>
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={26} color="#111" />
                </TouchableOpacity>
                <Text style={s.title}>급여 상세</Text>
                <View style={{ width: 26 }} />
            </View>

            <View style={s.content}>
                <Text style={s.period}>{item.period}</Text>
                <View style={s.row}>
                    <Text style={s.label}>총 근무시간</Text>
                    <Text style={s.value}>{item.totalHours}시간</Text>
                </View>
                <View style={s.row}>
                    <Text style={s.label}>시급</Text>
                    <Text style={s.value}>₩{item.hourlyWage.toLocaleString()}</Text>
                </View>
                <View style={s.row}>
                    <Text style={s.label}>기본급</Text>
                    <Text style={s.value}>₩{item.regularPay.toLocaleString()}</Text>
                </View>
                {item.bonus > 0 && (
                    <View style={s.row}>
                        <Text style={s.label}>보너스</Text>
                        <Text style={s.value}>₩{item.bonus.toLocaleString()}</Text>
                    </View>
                )}
                <View style={s.row}>
                    <Text style={s.label}>총지급액</Text>
                    <Text style={[s.value, { color: "#007AFF" }]}>
                        ₩{item.finalPay.toLocaleString()}
                    </Text>
                </View>
                <Text style={s.status}>상태: {item.status}</Text>
            </View>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
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
    content: { padding: 20 },
    period: { fontSize: 18, fontWeight: "bold", marginBottom: 20 },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    label: { fontSize: 15, color: "#333" },
    value: { fontSize: 15, fontWeight: "bold", color: "#111" },
    status: { marginTop: 20, color: "#555" },
});
