import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars";

export default function ScheduleScreen({ navigation }: any) {
    const [selectedDate, setSelectedDate] = useState("");

    // 근무 일정 예시 데이터
    const workSchedules: Record<string, { start: string; end: string }> = {
        "2025-10-15": { start: "10:00", end: "18:00" },
        "2025-10-16": { start: "12:00", end: "20:00" },
        "2025-10-17": { start: "09:00", end: "17:00" },
    };

    return (
        <View style={s.container}>
            {/* 상단 헤더 */}
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={28} color="#111" />
                </TouchableOpacity>
                <Text style={s.title}>📅 근무 일정</Text>
                <View style={{ width: 28 }} />
            </View>

            {/* 달력 */}
            <Calendar
                onDayPress={(day) => setSelectedDate(day.dateString)}
                markedDates={{
                    ...Object.keys(workSchedules).reduce((acc, date) => {
                        acc[date] = { marked: true, dotColor: "#007AFF" };
                        return acc;
                    }, {} as any),
                    [selectedDate]: {
                        selected: true,
                        marked: true,
                        selectedColor: "#007AFF",
                    },
                }}
                theme={{
                    todayTextColor: "#007AFF",
                    selectedDayBackgroundColor: "#007AFF",
                    arrowColor: "#007AFF",
                }}
            />

            {/* 선택된 날짜의 일정 표시 */}
            <View style={s.detailBox}>
                {selectedDate ? (
                    workSchedules[selectedDate] ? (
                        <>
                            <Text style={s.detailDate}>{selectedDate}</Text>
                            <Text style={s.detailText}>
                                근무 시간: {workSchedules[selectedDate].start} ~ {workSchedules[selectedDate].end}
                            </Text>
                        </>
                    ) : (
                        <>
                            <Text style={s.detailDate}>{selectedDate}</Text>
                            <Text style={s.noWorkText}>이 날은 근무 일정이 없습니다.</Text>
                        </>
                    )
                ) : (
                    <Text style={s.noWorkText}>날짜를 선택하세요.</Text>
                )}
            </View>
        </View>
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
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        backgroundColor: "#fff",
        elevation: 3,
    },
    title: { fontSize: 20, fontWeight: "bold", color: "#111" },
    detailBox: {
        padding: 20,
        alignItems: "center",
    },
    detailDate: { fontSize: 18, fontWeight: "bold", marginBottom: 6 },
    detailText: { fontSize: 16, color: "#333" },
    noWorkText: { fontSize: 16, color: "#777" },
});
