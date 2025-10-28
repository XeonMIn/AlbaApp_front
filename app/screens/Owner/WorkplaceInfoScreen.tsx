import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WorkplaceInfoScreen({ navigation }: any) {
    // 임시 매장 데이터 (나중에 백엔드에서 받아올 예정)
    const workplace = {
        name: "스마트커피 홍대점",
        address: "서울 마포구 양화로 45길 12",
        phone: "02-123-4567",
        openTime: "09:00",
        closeTime: "22:00",
        employees: 5,
    };

    return (
        <SafeAreaView style={s.container}>
            {/* 상단 헤더 */}
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={26} color="#111" />
                </TouchableOpacity>
                <Text style={s.title}>매장 정보</Text>
                <View style={{ width: 26 }} />
            </View>

            <ScrollView contentContainerStyle={s.scroll}>
                <View style={s.infoCard}>
                    <Text style={s.label}>매장명</Text>
                    <Text style={s.value}>{workplace.name}</Text>

                    <Text style={s.label}>주소</Text>
                    <Text style={s.value}>{workplace.address}</Text>

                    <Text style={s.label}>연락처</Text>
                    <Text style={s.value}>{workplace.phone}</Text>

                    <Text style={s.label}>영업시간</Text>
                    <Text style={s.value}>
                        {workplace.openTime} ~ {workplace.closeTime}
                    </Text>

                    <Text style={s.label}>직원 수</Text>
                    <Text style={s.value}>{workplace.employees}명</Text>
                </View>

                {/* 매장 수정 버튼 */}
                <TouchableOpacity
                    style={s.button}
                    onPress={() => alert("매장 정보 수정 기능은 추후 추가 예정입니다.")}
                >
                    <Ionicons name="create-outline" size={20} color="#fff" />
                    <Text style={s.buttonText}>매장 정보 수정</Text>
                </TouchableOpacity>
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
    scroll: { padding: 20 },
    infoCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 20,
        elevation: 2,
    },
    label: { color: "#777", fontSize: 13, marginTop: 10 },
    value: { color: "#111", fontSize: 16, fontWeight: "500" },
    button: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#007AFF",
        padding: 14,
        borderRadius: 10,
        marginTop: 30,
        elevation: 2,
    },
    buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold", marginLeft: 6 },
});
