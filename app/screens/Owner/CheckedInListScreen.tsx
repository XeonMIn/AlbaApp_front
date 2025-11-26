import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { getTodayCheckedInList, type CheckedInMemberDto } from "@/api/attendance.api";

function fmt(t?: string) {
    if (!t) return "";
    const d = new Date(t);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
}

export default function CheckedInListScreen() {
    const navigation = useNavigation();
    const { workplaceId } = useSelector((s: RootState) => s.user);
    const [loading, setLoading] = useState(false);
    const [list, setList] = useState<CheckedInMemberDto[]>([]);

    useEffect(() => {
        (async () => {
            if (!workplaceId) {
                setList([]);
                return;
            }
            try {
                setLoading(true);
                const res = await getTodayCheckedInList(workplaceId);
                setList(res);
            } finally {
                setLoading(false);
            }
        })();
    }, [workplaceId]);

    return (
        <SafeAreaView style={s.safe}>
            {/* 헤더 */}
            <View style={s.header}>
                <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={24} color="#111" />
                </TouchableOpacity>

                <Text style={s.headerTitle}>출근 인원</Text>

                {/* 타이틀을 가운데 정렬하기 위한 더미 우측 영역 */}
                <View style={s.rightSpacer} />
            </View>

            {/* 본문 */}
            <View style={s.container}>
                {!workplaceId ? (
                    <View style={s.center}>
                        <Text>대표 매장을 먼저 선택해주세요.</Text>
                    </View>
                ) : loading ? (
                    <View style={s.center}>
                        <ActivityIndicator />
                    </View>
                ) : list.length === 0 ? (
                    <View style={s.center}>
                        <Text>현재 출근 중인 인원이 없습니다.</Text>
                    </View>
                ) : (
                    <FlatList
                        data={list}
                        keyExtractor={(x) => String(x.memberId)}
                        renderItem={({ item }) => (
                            <View style={s.row}>
                                <Text style={s.name}>{item.memberName ?? "직원"}</Text>
                                <Text style={s.time}>{fmt(item.checkInAt)} 출근</Text>
                            </View>
                        )}
                        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                        contentContainerStyle={{ padding: 16 }}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "#f8f9fb" },

    header: {
        height: 52,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 8,
        backgroundColor: "#f8f9fb",
    },
    backBtn: {
        width: 44,
        height: 44,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 22,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#111",
    },
    rightSpacer: { width: 44, height: 44 },

    container: { flex: 1, backgroundColor: "#f8f9fb" },
    center: { flex: 1, alignItems: "center", justifyContent: "center" },

    row: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        // shadow (iOS) + elevation (Android)
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 2,
    },
    name: { fontSize: 16, fontWeight: "bold", color: "#111" },
    time: { fontSize: 14, color: "#555" },
});
