// app/screens/Owner/OwnerScheduleScreen.tsx
import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    TextInput,
    ScrollView,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { SafeAreaView } from "react-native-safe-area-context";

// ✅ 한국어 달력 설정
LocaleConfig.locales["ko"] = {
    monthNames: ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"],
    monthNamesShort: ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"],
    dayNames: ["일요일","월요일","화요일","수요일","목요일","금요일","토요일"],
    dayNamesShort: ["일","월","화","수","목","금","토"],
    today: "오늘",
};
LocaleConfig.defaultLocale = "ko";

type Schedule = {
    id: string;
    date: string;
    employee: string;
    start: string;
    end: string;
    note?: string;
};

export default function OwnerScheduleScreen() {
    const [selectedDate, setSelectedDate] = useState("");
    const [schedules, setSchedules] = useState<Schedule[]>([
        { id: "1", date: "2025-10-25", employee: "김선민", start: "09:00", end: "17:00" },
        { id: "2", date: "2025-10-25", employee: "박지훈", start: "12:00", end: "20:00" },
        { id: "3", date: "2025-10-26", employee: "이유진", start: "10:00", end: "18:00" },
    ]);
    const [modalVisible, setModalVisible] = useState(false);
    const [employeeName, setEmployeeName] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [note, setNote] = useState("");

    // 날짜 클릭 시
    const handleDayPress = (day: any) => {
        setSelectedDate(day.dateString);
    };

    // 일정 추가
    const handleAddSchedule = () => {
        if (!employeeName || !startTime || !endTime) {
            return Alert.alert("입력 오류", "모든 항목을 입력해주세요.");
        }
        const newSchedule: Schedule = {
            id: Date.now().toString(),
            date: selectedDate,
            employee: employeeName,
            start: startTime,
            end: endTime,
            note,
        };
        setSchedules([...schedules, newSchedule]);
        setModalVisible(false);
        setEmployeeName("");
        setStartTime("");
        setEndTime("");
        setNote("");
    };

    // 일정 삭제
    const handleDelete = (id: string) => {
        setSchedules(schedules.filter((s) => s.id !== id));
    };

    // 특정 날짜의 스케줄 필터링
    const filteredSchedules = schedules.filter((s) => s.date === selectedDate);

    // 표시용 달력 마킹
    const markedDates = schedules.reduce((acc: any, cur) => {
        acc[cur.date] = { marked: true, dotColor: "#007AFF" };
        return acc;
    }, {});

    return (
        <SafeAreaView style={s.container}>
            {/* 상단 헤더 */}
            <View style={s.header}>
                <Text style={s.title}>근무 스케줄</Text>
                <TouchableOpacity
                    onPress={() => {
                        if (selectedDate) setModalVisible(true);
                        else Alert.alert("날짜 선택", "먼저 날짜를 선택해주세요.");
                    }}
                >
                    <Ionicons name="add-circle-outline" size={28} color="#007AFF" />
                </TouchableOpacity>
            </View>

            {/* 달력 */}
            <Calendar
                onDayPress={handleDayPress}
                markedDates={{
                    ...markedDates,
                    [selectedDate]: {
                        ...(markedDates[selectedDate] || {}),
                        selected: true,
                        selectedColor: "#007AFF",
                    },
                }}
                theme={{
                    todayTextColor: "#007AFF",
                    arrowColor: "#007AFF",
                    monthTextColor: "#111",
                    textDayFontWeight: "500",
                    textMonthFontWeight: "bold",
                }}
                style={s.calendar}
            />

            {/* 일정 리스트 */}
            <ScrollView contentContainerStyle={s.listContainer}>
                {selectedDate ? (
                    filteredSchedules.length > 0 ? (
                        filteredSchedules.map((sItem) => (
                            <View key={sItem.id} style={s.scheduleCard}>
                                <View style={{ flex: 1 }}>
                                    <Text style={s.cardTitle}>{sItem.employee}</Text>
                                    <Text style={s.cardText}>
                                        근무시간: {sItem.start} ~ {sItem.end}
                                    </Text>
                                    {sItem.note && <Text style={s.noteText}>📎 {sItem.note}</Text>}
                                </View>
                                <TouchableOpacity onPress={() => handleDelete(sItem.id)}>
                                    <Ionicons name="trash-outline" size={22} color="#FF3B30" />
                                </TouchableOpacity>
                            </View>
                        ))
                    ) : (
                        <Text style={s.noScheduleText}>등록된 근무 일정이 없습니다.</Text>
                    )
                ) : (
                    <Text style={s.noScheduleText}>날짜를 선택해주세요.</Text>
                )}
            </ScrollView>

            {/* 일정 추가 모달 */}
            <Modal visible={modalVisible} transparent animationType="fade">
                <View style={s.modalBackground}>
                    <View style={s.modalContainer}>
                        <Text style={s.modalTitle}>{selectedDate} 일정 추가</Text>

                        <TextInput
                            style={s.input}
                            placeholder="직원 이름"
                            value={employeeName}
                            onChangeText={setEmployeeName}
                        />
                        <TextInput
                            style={s.input}
                            placeholder="근무 시작 시간 (예: 09:00)"
                            value={startTime}
                            onChangeText={setStartTime}
                        />
                        <TextInput
                            style={s.input}
                            placeholder="근무 종료 시간 (예: 18:00)"
                            value={endTime}
                            onChangeText={setEndTime}
                        />
                        <TextInput
                            style={[s.input, { height: 60 }]}
                            placeholder="비고 (선택)"
                            value={note}
                            onChangeText={setNote}
                            multiline
                        />

                        <View style={s.modalButtons}>
                            <TouchableOpacity style={s.saveButton} onPress={handleAddSchedule}>
                                <Text style={s.buttonText}>저장</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={s.cancelButton}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={s.cancelText}>닫기</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f8f9fb" },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 14,
        backgroundColor: "#fff",
        elevation: 3,
    },
    title: { fontSize: 20, fontWeight: "bold", color: "#111" },
    calendar: {
        margin: 10,
        borderRadius: 12,
        backgroundColor: "#fff",
        elevation: 2,
    },
    listContainer: { padding: 16, paddingBottom: 100 },
    scheduleCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
        elevation: 2,
        marginBottom: 10,
    },
    cardTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
    cardText: { fontSize: 14, color: "#333" },
    noteText: { fontSize: 13, color: "#666", marginTop: 4 },
    noScheduleText: {
        textAlign: "center",
        color: "#666",
        marginTop: 20,
        fontSize: 15,
    },
    modalBackground: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        backgroundColor: "#fff",
        borderRadius: 12,
        width: "85%",
        padding: 20,
        elevation: 5,
    },
    modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
    },
    modalButtons: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 10,
    },
    saveButton: {
        backgroundColor: "#007AFF",
        padding: 10,
        borderRadius: 8,
        minWidth: 80,
    },
    cancelButton: { padding: 10, borderRadius: 8, minWidth: 80 },
    buttonText: { color: "#fff", fontWeight: "bold", textAlign: "center" },
    cancelText: { color: "#333", textAlign: "center" },
});
