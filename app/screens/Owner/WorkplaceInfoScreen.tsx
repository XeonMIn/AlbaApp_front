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
import { useIsFocused } from "@react-navigation/native";
import { RootState } from "@/store/store";
import {
    getWorkplaceDetail,
    getWorkplaceEmployeesCount,
    getMyWorkplaces,
    WorkplaceResponse,
} from "@/api/workplace.api";

export default function WorkplaceInfoScreen({ navigation }: any) {
    const user = useSelector((state: RootState) => state.user);
    const workplaceId = user.workplaceId;
    const isFocused = useIsFocused();

    const [workplace, setWorkplace] = useState<WorkplaceResponse | null>(null);
    const [employeesCount, setEmployeesCount] = useState<number | null>(null);
    const [otherWorkplaces, setOtherWorkplaces] = useState<WorkplaceResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAll = useCallback(async () => {
        if (!workplaceId) {
            setError("등록된 매장이 없습니다. 먼저 매장을 등록해주세요.");
            setWorkplace(null);
            setEmployeesCount(null);
            setOtherWorkplaces([]);
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            setError(null);

            const [detail, count, mine] = await Promise.all([
                getWorkplaceDetail(workplaceId),
                getWorkplaceEmployeesCount(workplaceId),
                getMyWorkplaces(),
            ]);

            setWorkplace(detail);
            setEmployeesCount(count);
            setOtherWorkplaces((mine || []).filter((w) => w.id !== workplaceId));
        } catch (e) {
            console.log("매장 정보 조회 실패:", e);
            setError("매장 정보를 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    }, [workplaceId]);

    useEffect(() => {
        if (isFocused) fetchAll();
    }, [isFocused, fetchAll]);

    // 로딩
    if (loading) {
        return (
            <SafeAreaView style={s.container}>
                <Header navigation={navigation} />
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
                <Header navigation={navigation} />
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
            <Header navigation={navigation} />
            <ScrollView contentContainerStyle={s.scroll}>
                {/* 대표 매장 카드 → 수정 화면으로 */}
                <TouchableOpacity
                    activeOpacity={0.85}
                    style={s.card}
                    onPress={() => navigation.navigate("WorkplaceEdit", { workplace })}
                >
                    <Text style={s.storeName}>{workplace.name}</Text>
                    <Text style={s.address}>{workplace.address}</Text>

                    <View style={s.divider} />
                    <Row label="사업자 번호" value={workplace.businessnumber} />
                    <Row label="영업 시간" value={workplace.businesshour} />
                    <Row label="매장 전화번호" value={workplace.contactphoneNumber} />
                    {typeof employeesCount === "number" && <Row label="직원 수" value={`${employeesCount}명`} />}
                </TouchableOpacity>

                {/* 내 다른 매장 목록 */}
                {otherWorkplaces.length > 0 && (
                    <View style={s.sectionWrap}>
                        <Text style={s.sectionTitle}>내 다른 매장</Text>
                        {otherWorkplaces.map((w) => (
                            <TouchableOpacity
                                key={w.id}
                                activeOpacity={0.85}
                                style={s.card}
                                onPress={() => navigation.navigate("WorkplaceEdit", { workplace: w })}
                            >
                                <Text style={s.storeName}>{w.name}</Text>
                                <Text style={s.address}>{w.address}</Text>

                                <View style={s.divider} />
                                <Row label="사업자 번호" value={w.businessnumber} />
                                <Row label="영업 시간" value={w.businesshour} />
                                <Row label="매장 전화번호" value={w.contactphoneNumber} />
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

function Header({ navigation }: any) {
    return (
        <View style={s.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="chevron-back" size={26} color="#111" />
            </TouchableOpacity>
            <Text style={s.headerTitle}>매장 정보</Text>
            <TouchableOpacity onPress={() => navigation.navigate("RegisterWorkplace")}>
                <Ionicons name="add-outline" size={26} color="#007AFF" />
            </TouchableOpacity>
        </View>
    );
}

function Row({ label, value }: { label: string; value?: string | null }) {
    return (
        <View style={s.row}>
            <Text style={s.label}>{label}</Text>
            <Text style={s.value}>{value ?? "-"}</Text>
        </View>
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
    centerBox: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
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
    sectionWrap: { marginTop: 8 },
    sectionTitle: { fontSize: 16, fontWeight: "700", color: "#111", marginBottom: 8, paddingHorizontal: 2 },
});
