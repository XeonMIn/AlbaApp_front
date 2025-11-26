import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Pressable,
    Alert,
    ScrollView,
    TouchableOpacity
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { getPayDetail, updatePay } from "@/api/pay.api";

export default function PayEditScreen({ route, navigation }: any) {
    const { payId } = route.params;

    const [pay, setPay] = useState<any>(null);

    useEffect(() => {
        loadPayDetail();
    }, []);

    const loadPayDetail = async () => {
        const data = await getPayDetail(payId);
        setPay(data);
    };

    const handleSave = async () => {
        try {
            await updatePay(pay.id, {
                totalHours: pay.totalHours,
                hourlyWage: pay.hourlyWage,
                bonus: pay.bonus,
                status: pay.status,
            });

            Alert.alert("저장 완료", "급여 정보가 수정되었습니다.");
            navigation.goBack();
        } catch (error) {
            Alert.alert("오류", "저장에 실패했습니다.");
        }
    };

    if (!pay) return null;

    return (
        <SafeAreaView style={styles.safe}>

            {/* 커스텀 헤더 */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={26} color="#111" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>급여 수정</Text>

                {/* 오른쪽 여백 정렬용 */}
                <View style={{ width: 26 }} />
            </View>

            <ScrollView contentContainerStyle={styles.container}>

                {/* 상단 제목 */}
                <Text style={styles.period}>{pay.period}</Text>

                {/* 총 근무시간 */}
                <Text style={styles.label}>총 근무시간</Text>
                <TextInput
                    value={String(pay.totalHours)}
                    onChangeText={(v) => setPay({ ...pay, totalHours: Number(v) })}
                    keyboardType="numeric"
                    style={styles.input}
                />

                {/* 시급 */}
                <Text style={styles.label}>시급</Text>
                <TextInput
                    value={String(pay.hourlyWage)}
                    onChangeText={(v) => setPay({ ...pay, hourlyWage: Number(v) })}
                    keyboardType="numeric"
                    style={styles.input}
                />

                {/* 보너스 */}
                <Text style={styles.label}>보너스</Text>
                <TextInput
                    value={String(pay.bonus)}
                    onChangeText={(v) => setPay({ ...pay, bonus: Number(v) })}
                    keyboardType="numeric"
                    style={styles.input}
                />

                {/* 상태 */}
                <Text style={styles.label}>상태 (예: 예정, 지급완료)</Text>
                <TextInput
                    value={pay.status}
                    onChangeText={(v) => setPay({ ...pay, status: v })}
                    style={styles.input}
                />

                {/* 저장 버튼 */}
                <Pressable style={styles.saveBtn} onPress={handleSave}>
                    <Text style={styles.saveText}>저장</Text>
                </Pressable>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        backgroundColor: "#fff",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#111",
    },
    container: {
        padding: 20,
        paddingBottom: 40,
    },
    period: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        marginTop: 15,
        marginBottom: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 10,
        padding: 12,
        fontSize: 15,
        backgroundColor: "#fafafa",
    },
    saveBtn: {
        marginTop: 30,
        backgroundColor: "#007bff",
        paddingVertical: 16,
        borderRadius: 10,
    },
    saveText: {
        color: "#fff",
        textAlign: "center",
        fontSize: 17,
        fontWeight: "bold",
    },
});
