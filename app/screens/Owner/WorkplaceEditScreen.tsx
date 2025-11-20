import React, { useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { WorkplaceResponse, updateWorkplace, getWorkplaceDetail } from "@/api/workplace.api";
import API from "@/api/axios";
import { setUser } from "@/store/userSlice";

type RouteParams = {
    workplace?: WorkplaceResponse;
    workplaceId?: number;
};

export default function WorkplaceEditScreen() {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const dispatch = useDispatch();
    const currentUser = useSelector((s: RootState) => s.user);

    const passed: RouteParams = route.params ?? {};
    const editingId: number | null = useMemo(() => {
        if (passed.workplace?.id) return passed.workplace.id;
        if (passed.workplaceId) return passed.workplaceId;
        return currentUser.workplaceId ?? null;
    }, [passed, currentUser.workplaceId]);

    const [form, setForm] = useState({
        name: passed.workplace?.name ?? "",
        address: passed.workplace?.address ?? "",
        businessnumber: passed.workplace?.businessnumber ?? "",
        businesshour: passed.workplace?.businesshour ?? "",
        contactphoneNumber: passed.workplace?.contactphoneNumber ?? "",
    });
    const [loading, setLoading] = useState(false);

    // 혹시 파라미터 없이 들어오면 상세 조회로 초기화
    useEffect(() => {
        const init = async () => {
            if (!passed.workplace && editingId) {
                try {
                    const w = await getWorkplaceDetail(editingId);
                    setForm({
                        name: w.name,
                        address: w.address,
                        businessnumber: w.businessnumber,
                        businesshour: w.businesshour,
                        contactphoneNumber: w.contactphoneNumber,
                    });
                } catch (e) {
                    console.log("[Edit] 상세 조회 실패:", e);
                }
            }
        };
        init();
    }, [editingId]);

    const onChange = (key: keyof typeof form, v: string) =>
        setForm((p) => ({ ...p, [key]: v }));

    const onSave = async () => {
        if (!editingId) {
            Alert.alert("오류", "수정할 매장 ID를 찾을 수 없습니다.");
            return;
        }
        if (!form.name.trim() || !form.address.trim() || !form.businessnumber.trim()) {
            Alert.alert("입력 오류", "이름/주소/사업자번호는 필수입니다.");
            return;
        }

        try {
            setLoading(true);
            await updateWorkplace(editingId, {
                name: form.name.trim(),
                address: form.address.trim(),
                businessnumber: form.businessnumber.trim(),
                businesshour: form.businesshour.trim(),
                contactphoneNumber: form.contactphoneNumber.trim(),
            });

            // 현재 대표 매장을 수정했다면 Redux의 workplaceName 동기화
            if (currentUser.workplaceId === editingId) {
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
                            accessToken: currentUser.accessToken, // 기존 토큰 유지
                            workplaceId: hasWorkplace ? me.workplaceId : null,
                            workplaceName: hasWorkplace ? me.workplaceName : null,
                        } as any)
                    );
                } catch (e) {
                    // 실패해도 치명적이지 않음(InfoScreen에서 재조회됨)
                    console.log("[Edit] /member/me refresh 실패:", e);
                }
            }

            Alert.alert("완료", "매장 정보가 수정되었습니다.", [
                { text: "확인", onPress: () => navigation.goBack() },
            ]);
        } catch (e: any) {
            console.log("[Edit] 수정 실패:", e?.response?.data || e.message);
            Alert.alert("수정 실패", e?.response?.data?.message || "다시 시도해주세요.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={s.container}>
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={26} color="#111" />
                </TouchableOpacity>
                <Text style={s.headerTitle}>근무지 수정</Text>
                <View style={{ width: 26 }} />
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={s.scroll}>
                    <Text style={s.label}>매장 이름</Text>
                    <TextInput style={s.input} value={form.name} onChangeText={(v) => onChange("name", v)} />

                    <Text style={s.label}>주소</Text>
                    <TextInput style={s.input} value={form.address} onChangeText={(v) => onChange("address", v)} />

                    <Text style={s.label}>사업자 번호</Text>
                    <TextInput
                        style={s.input}
                        value={form.businessnumber}
                        onChangeText={(v) => onChange("businessnumber", v)}
                    />

                    <Text style={s.label}>영업 시간</Text>
                    <TextInput
                        style={s.input}
                        placeholder="예: 09:00 ~ 18:00"
                        value={form.businesshour}
                        onChangeText={(v) => onChange("businesshour", v)}
                    />

                    <Text style={s.label}>매장 전화번호</Text>
                    <TextInput
                        style={s.input}
                        keyboardType="phone-pad"
                        value={form.contactphoneNumber}
                        onChangeText={(v) => onChange("contactphoneNumber", v)}
                    />

                    <TouchableOpacity style={[s.saveBtn, loading && { opacity: 0.6 }]} onPress={onSave} disabled={loading}>
                        <Text style={s.saveText}>{loading ? "저장 중..." : "저장"}</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
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
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#ddd",
        backgroundColor: "#fff",
    },
    headerTitle: { fontSize: 18, fontWeight: "600", color: "#111" },
    scroll: { padding: 16, paddingBottom: 24 },
    label: { marginTop: 12, marginBottom: 6, fontSize: 13, color: "#555" },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 10,
        padding: 12,
        backgroundColor: "#fafafa",
    },
    saveBtn: {
        marginTop: 20,
        backgroundColor: "#007AFF",
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: "center",
    },
    saveText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
