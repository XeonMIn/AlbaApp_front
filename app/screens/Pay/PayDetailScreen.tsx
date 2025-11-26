// app/screens/Pay/PayDetailScreen.tsx

import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { getPayDetail } from "@/api/pay.api";

export default function PayDetailScreen({ route, navigation }: any) {
    const { payId } = route.params;    // ★ PayListScreen에서 넘겨준 payId 받기
    const [detail, setDetail] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        load();
    }, [payId]);

    const load = async () => {
        try {
            const data = await getPayDetail(payId); // ★ 급여 상세 API 호출
            setDetail(data);
        } catch (e) {
            console.log("급여 상세 불러오기 오류:", e);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !detail) {
        return (
            <SafeAreaView style={s.container}>
                <ActivityIndicator size="large" style={{ marginTop: 30 }} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={s.container}>
            {/* 헤더 */}
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={26} color="#111" />
                </TouchableOpacity>
                <Text style={s.title}>급여 상세</Text>
                <View style={{ width: 26 }} />
            </View>

            {/* 본문 */}
            <View style={s.content}>
                <Text style={s.period}>{detail.period}</Text>

                <View style={s.row}>
                    <Text style={s.label}>총 근무시간</Text>
                    <Text style={s.value}>{detail.totalHours}시간</Text>
                </View>

                <View style={s.row}>
                    <Text style={s.label}>시급</Text>
                    <Text style={s.value}>₩{detail.hourlyWage.toLocaleString()}</Text>
                </View>

                <View style={s.row}>
                    <Text style={s.label}>기본급</Text>
                    <Text style={s.value}>₩{detail.regularPay.toLocaleString()}</Text>
                </View>

                <View style={s.row}>
                    <Text style={s.label}>보너스</Text>
                    <Text style={s.value}>₩{detail.bonus.toLocaleString()}</Text>
                </View>

                <View style={s.row}>
                    <Text style={[s.label, { fontWeight: "bold" }]}>총지급액</Text>
                    <Text style={[s.value, { color: "#007AFF", fontWeight: "bold" }]}>
                        ₩{detail.finalPay.toLocaleString()}
                    </Text>
                </View>

                <Text style={s.status}>상태: {detail.status}</Text>
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
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    title: { fontSize: 18, fontWeight: "bold", color: "#111" },

    content: { padding: 16 },
    period: { fontSize: 18, fontWeight: "bold", marginBottom: 20 },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: 8,
    },
    label: { fontSize: 15, color: "#555" },
    value: { fontSize: 15, fontWeight: "600" },

    status: { marginTop: 20, fontSize: 14, color: "#777" },
});
