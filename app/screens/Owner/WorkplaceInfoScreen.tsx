import React, { useCallback, useEffect, useState } from "react";
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
import { useIsFocused } from "@react-navigation/native"; // ✅ 추가
import { RootState } from "@/store/store";
import {
    getWorkplaceDetail,
    getWorkplaceEmployeesCount,
    WorkplaceResponse,
} from "@/api/workplace.api";

export default function WorkplaceInfoScreen({ navigation }: any) {
    const user = useSelector((state: RootState) => state.user);
    const workplaceId = user.workplaceId;
    const isFocused = useIsFocused(); // ✅ 포커스 감지

    const [workplace, setWorkplace] = useState<WorkplaceResponse | null>(null);
    const [employeesCount, setEmployeesCount] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAll = useCallback(async () => {
        if (!workplaceId) {
            setError("등록된 매장이 없습니다. 먼저 매장을 등록해주세요.");
            setWorkplace(null);
            setEmployeesCount(null);
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            setError(null);
            const detail = await getWorkplaceDetail(workplaceId);
            setWorkplace(detail);
            const count = await getWorkplaceEmployeesCount(workplaceId);
            setEmployeesCount(count);
        } catch (e) {
            console.log("매장 정보 조회 실패:", e);
            setError("매장 정보를 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    }, [workplaceId]);

    // ✅ workplaceId가 바뀌거나 화면이 다시 포커스될 때마다 재조회
    useEffect(() => {
        if (isFocused) {
            fetchAll();
        }
    }, [isFocused, fetchAll]);

    // 로딩
    if (loading) {
        return (
            <SafeAreaView style={s.container}>
                <View style={s.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="chevron-back" size={26} color="#111" />
                    </TouchableOpacity>
                    <Text style={s.headerTitle}>매장 정보</Text>
                    <TouchableOpacity onPress={() => navigation.navigate("RegisterWorkplace")}>
                        <Ionicons name="add-outline" size={26} color="#007AFF" />
                    </TouchableOpacity>
                </View>
                <View style={s.centerBox}>
                    <ActivityIndicator size="large" />
                    <Text style={{ marginTop: 8 }}>매장 정보를 불러오는 중입니다…</Text>
                </View>
            </SafeAreaView>
        );
    }

    // 에러/없음
    if (error || !workplace) {
        return (
            <SafeAreaView style={s.container}>
                <View style={s.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="chevron-back" size={26} color="#111" />
                    </TouchableOpacity>
                    <Text style={s.headerTitle}>매장 정보</Text>
                    <TouchableOpacity onPress={() => navigation.navigate("RegisterWorkplace")}>
                        <Ionicons name="add-outline" size={26} color="#007AFF" />
                    </TouchableOpacity>
                </View>

                <View style={s.centerBox}>
                    <Ionicons name="alert-circle-outline" size={40} color="#ff3b30" />
                    <Text style={{ marginTop: 10, fontSize: 15, color: "#333", textAlign: "center" }}>
                        {error ?? "매장 정보를 찾을 수 없습니다."}
                    </Text>
                    <TouchableOpacity style={s.inlineLink} onPress={() => navigation.navigate("RegisterWorkplace")}>
                        <Text style={s.inlineLinkText}>매장 등록하러 가기</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // 정상
    return (
        <SafeAreaView style={s.container}>
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={26} color="#111" />
                </TouchableOpacity>
                <Text style={s.headerTitle}>매장 정보</Text>
                <TouchableOpacity onPress={() => navigation.navigate("RegisterWorkplace")}>
                    <Ionicons name="add-outline" size={26} color="#007AFF" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={s.scroll}>
                <TouchableOpacity
                    activeOpacity={0.8}
                    style={s.card}
                    onPress={() => navigation.navigate("RegisterWorkplace", { mode: "edit", workplace })}
                >
                    <Text style={s.storeName}>{workplace.name}</Text>
                    <Text style={s.address}>{workplace.address}</Text>

                    <View style={s.divider} />

                    <View style={s.row}>
                        <Text style={s.label}>사업자 번호</Text>
                        <Text style={s.value}>{workplace.businessnumber}</Text>
                    </View>
                    <View style={s.row}>
                        <Text style={s.label}>영업 시간</Text>
                        <Text style={s.value}>{workplace.businesshour}</Text>
                    </View>
                    <View style={s.row}>
                        <Text style={s.label}>매장 전화번호</Text>
                        <Text style={s.value}>{workplace.contactphoneNumber}</Text>
                    </View>
                    {typeof employeesCount === "number" && (
                        <View style={s.row}>
                            <Text style={s.label}>직원 수</Text>
                            <Text style={s.value}>{employeesCount}명</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f7f7f7" },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#ddd",
        backgroundColor: "#fff",
    },
    headerTitle: { fontSize: 18, fontWeight: "600", color: "#111" },
    scroll: { padding: 16, paddingBottom: 32 },
    centerBox: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 18,
        marginBottom: 16,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    storeName: { fontSize: 20, fontWeight: "700", marginBottom: 4, color: "#111" },
    address: { fontSize: 14, color: "#555" },
    divider: { height: StyleSheet.hairlineWidth, backgroundColor: "#eee", marginVertical: 12 },
    row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8 },
    label: { color: "#777", fontSize: 13 },
    value: { color: "#111", fontSize: 15, fontWeight: "500" },
    inlineLink: { marginTop: 16, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: "#eef3ff" },
    inlineLinkText: { color: "#2e6bff", fontWeight: "700" },
});
