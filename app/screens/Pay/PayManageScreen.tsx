// app/screens/Pay/PayManageScreen.tsx

import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

import {
    getPayListByWorkplace,
    generatePay
} from "@/api/pay.api";

export default function PayManageScreen({ navigation }: any) {

    const user = useSelector((state: RootState) => state.user);
    const workplaceId = user.workplaceId;

    const [payList, setPayList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [genLoading, setGenLoading] = useState(false);

    useEffect(() => {
        load();
    }, [workplaceId]);

    const load = async () => {
        if (!workplaceId) return;

        try {
            const data = await getPayListByWorkplace(workplaceId!);
            setPayList(data);
        } catch (e) {
            console.log("급여 목록 오류:", e);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        if (genLoading) return;

        try {
            setGenLoading(true);
            const res = await generatePay(workplaceId!);

            Alert.alert(
                "급여 생성 완료",
                res.message ?? "급여가 생성되었습니다."
            );

            load(); // 생성 후 새로고침

        } catch (e) {
            console.log("급여 생성 오류:", e);
            Alert.alert("오류", "급여 생성 중 문제가 발생했습니다.");
        } finally {
            setGenLoading(false);
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
                <Text style={s.title}>사장님 급여 관리</Text>

                {/* 급여 생성 버튼 */}
                <TouchableOpacity
                    style={s.createBtn}
                    onPress={handleGenerate}
                    disabled={genLoading}
                >
                    <Text style={s.createText}>
                        {genLoading ? "생성중..." : "급여 생성"}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* 급여 리스트 */}
            <ScrollView contentContainerStyle={s.content}>
                {payList.length === 0 ? (
                    <Text style={{ color: "#777", marginTop: 20, textAlign: "center" }}>
                        생성된 급여가 없습니다.
                    </Text>
                ) : (
                    payList.map((item: any) => (
                        <TouchableOpacity
                            key={item.id}
                            style={s.card}
                            activeOpacity={0.8}
                            onPress={() =>
                                navigation.navigate("PayEdit", { payId: item.id })
                            }
                        >
                            <Text style={s.name}>{item.name}</Text>
                            <Text style={s.period}>{item.period}</Text>

                            <Text style={s.detail}>
                                근무시간: {item.totalHours}시간 · 시급: ₩{item.hourlyWage.toLocaleString()}
                            </Text>

                            <Text style={s.finalPay}>
                                총지급액: ₩{item.finalPay.toLocaleString()}
                            </Text>

                            <Text style={s.status}>상태: {item.status}</Text>
                        </TouchableOpacity>
                    ))
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
        paddingVertical: 12,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        elevation: 2,
    },
    title: { fontSize: 18, fontWeight: "bold", color: "#111" },
    createBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: "#007AFF",
        borderRadius: 8,
    },
    createText: { color: "#fff", fontSize: 14, fontWeight: "600" },

    content: { padding: 16 },

    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
    },
    name: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
    period: { fontSize: 14, color: "#333", marginBottom: 4 },
    detail: { fontSize: 13, color: "#555" },
    finalPay: {
        marginTop: 6,
        fontSize: 15,
        fontWeight: "bold",
        color: "#007AFF",
    },
    status: { marginTop: 4, fontSize: 13, color: "#888" },
});
