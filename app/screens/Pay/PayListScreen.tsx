// app/screens/Pay/PayListScreen.tsx

import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

import { getPayListByMember } from "@/api/pay.api";   // ★ 알바생 급여 리스트 API

export default function PayListScreen({ navigation }: any) {
    // ★ Redux에서 로그인한 유저 정보 가져오기
    const user = useSelector((state: RootState) => state.user);
    const memberId = user.id;

    const [payList, setPayList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // ★ API 호출
    useEffect(() => {
        load();
    }, [memberId]);

    const load = async () => {
        try {
            const data = await getPayListByMember(memberId!); // ★ 본인 급여만 조회
            setPayList(data);
        } catch (e) {
            console.log("급여 목록 불러오기 오류:", e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
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
                <Text style={s.title}>💰 급여 내역</Text>
                <View style={{ width: 26 }} />
            </View>

            {/* 급여 리스트 */}
            <ScrollView contentContainerStyle={s.content}>
                {payList.length === 0 ? (
                    <Text style={{ color: "#777", marginTop: 20, textAlign: "center" }}>
                        급여 내역이 없습니다.
                    </Text>
                ) : (
                    payList.map((item: any) => {
                        return (
                            <TouchableOpacity
                                key={item.id}
                                style={s.card}
                                activeOpacity={0.8}
                                onPress={() => navigation.navigate("PayDetail", { payId: item.id })}
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
                        );
                    })
                )}

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
