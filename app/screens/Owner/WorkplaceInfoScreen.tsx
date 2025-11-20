import React, { useCallback, useEffect, useState } from "react";
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
import { useSelector, useDispatch } from "react-redux";
import { useIsFocused } from "@react-navigation/native";
import { RootState } from "@/store/store";
import {
    getWorkplaceDetail,
    getWorkplaceEmployeesCount,
    getMyWorkplaces,
    selectMyWorkplace,
    deleteWorkplace,
    WorkplaceResponse,
} from "@/api/workplace.api";
import API from "@/api/axios";
import { setUser } from "@/store/userSlice";

export default function WorkplaceInfoScreen({ navigation }: any) {
    const dispatch = useDispatch();
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

    /** ✅ 대표 매장 전환 */
    const handleSelect = async (target: WorkplaceResponse) => {
        if (target.id === workplaceId) {
            Alert.alert("알림", "이미 대표로 선택된 매장입니다.");
            return;
        }
        try {
            setLoading(true);
            await selectMyWorkplace(target.id);

            // 대표 매장 바뀌었으니 /member/me로 Redux 동기화
            const meRes = await API.get("/member/me");
            const me = meRes.data;
            const role = String(me.role ?? "").toUpperCase();
            const hasWorkplace = me.workplaceId !== null && me.workplaceId !== undefined;

            dispatch(
                setUser({
                    id: me.id,
                    userId: me.userId,
                    name: me.name,
                    role,
                    email: me.email,
                    phoneNumber: me.phoneNumber,
                    accessToken: user.accessToken,
                    workplaceId: hasWorkplace ? me.workplaceId : null,
                    workplaceName: hasWorkplace ? me.workplaceName : null,
                } as any)
            );

            await fetchAll();
            Alert.alert("완료", `"${target.name}"을(를) 대표 매장으로 선택했습니다.`);
        } catch (e: any) {
            console.log("[Select] 대표 매장 전환 실패:", e?.response?.data || e.message);
            Alert.alert("실패", e?.response?.data?.message || "대표 매장 전환에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    /** ✅ 매장 삭제 (확인 → 삭제 → Redux 동기화 → 재조회) */
    const handleDelete = (target: WorkplaceResponse) => {
        Alert.alert(
            "삭제 확인",
            `정말로 "${target.name}" 매장을 삭제할까요?\n이 작업은 되돌릴 수 없습니다.`,
            [
                { text: "취소", style: "cancel" },
                {
                    text: "삭제",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await deleteWorkplace(target.id);

                            // 현재 대표 매장을 삭제한 경우 → 내 정보 재조회로 Redux 동기화
                            if (target.id === workplaceId) {
                                try {
                                    const meRes = await API.get("/member/me");
                                    const me = meRes.data;
                                    const role = String(me.role ?? "").toUpperCase();
                                    const hasWorkplace = me.workplaceId !== null && me.workplaceId !== undefined;

                                    dispatch(
                                        setUser({
                                            id: me.id,
                                            userId: me.userId,
                                            name: me.name,
                                            role,
                                            email: me.email,
                                            phoneNumber: me.phoneNumber,
                                            accessToken: user.accessToken,
                                            workplaceId: hasWorkplace ? me.workplaceId : null,
                                            workplaceName: hasWorkplace ? me.workplaceName : null,
                                        } as any)
                                    );
                                } catch (e) {
                                    // 무시 (화면 재조회로 커버)
                                }
                            }

                            await fetchAll();
                            Alert.alert("삭제 완료", `"${target.name}" 매장을 삭제했습니다.`);
                        } catch (e: any) {
                            console.log("[Delete] 실패:", e?.response?.data || e.message);
                            Alert.alert("삭제 실패", e?.response?.data?.message || "매장 삭제에 실패했습니다.");
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

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
                {/* 대표 매장 카드 */}
                <View style={s.card}>
                    {/* 우측 상단 아이콘바: 대표 체크 + 휴지통 */}
                    <View style={s.iconBar}>
                        <View style={s.iconBtnDisabled}>
                            <Ionicons name="checkmark-circle" size={22} color="#2ecc71" />
                        </View>
                        <TouchableOpacity style={s.iconBtn} onPress={() => handleDelete(workplace)}>
                            <Ionicons name="trash-outline" size={20} color="#ff3b30" />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        activeOpacity={0.85}
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
                </View>

                {/* 다른 매장 목록 */}
                {otherWorkplaces.length > 0 && (
                    <View style={s.sectionWrap}>
                        <Text style={s.sectionTitle}>내 다른 매장</Text>
                        {otherWorkplaces.map((w) => (
                            <View key={w.id} style={s.card}>
                                {/* ✅ 우측 상단 아이콘바: 대표 전환 체크 + 휴지통(삭제) */}
                                <View style={s.iconBar}>
                                    <TouchableOpacity style={s.iconBtn} onPress={() => handleSelect(w)}>
                                        <Ionicons name="checkmark-circle-outline" size={22} color="#007AFF" />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={s.iconBtn} onPress={() => handleDelete(w)}>
                                        <Ionicons name="trash-outline" size={20} color="#ff3b30" />
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity
                                    activeOpacity={0.85}
                                    onPress={() => navigation.navigate("WorkplaceEdit", { workplace: w })}
                                >
                                    <Text style={s.storeName}>{w.name}</Text>
                                    <Text style={s.address}>{w.address}</Text>

                                    <View style={s.divider} />
                                    <Row label="사업자 번호" value={w.businessnumber} />
                                    <Row label="영업 시간" value={w.businesshour} />
                                    <Row label="매장 전화번호" value={w.contactphoneNumber} />
                                </TouchableOpacity>
                            </View>
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

    /** 우측 상단 아이콘바 (체크 + 휴지통) */
    iconBar: {
        position: "absolute",
        right: 10,
        top: 10,
        zIndex: 2,
        flexDirection: "row",
        gap: 8,
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 14,
        backgroundColor: "rgba(255,255,255,0.9)",
        alignItems: "center",
    },
    iconBtn: {
        padding: 2,
    },
    iconBtnDisabled: {
        padding: 2,
        opacity: 0.9,
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
