import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    TextInput,
    Alert,
    ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { SafeAreaView } from "react-native-safe-area-context";

// ✅ 한국어 캘린더 설정
LocaleConfig.locales["ko"] = {
    monthNames: [
        "1월","2월","3월","4월","5월","6월",
        "7월","8월","9월","10월","11월","12월"
    ],
    monthNamesShort: ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"],
    dayNames: ["일요일","월요일","화요일","수요일","목요일","금요일","토요일"],
    dayNamesShort: ["일","월","화","수","목","금","토"],
    today: "오늘",
};
LocaleConfig.defaultLocale = "ko";

// ✅ DateObject 타입 정의
type DateObject = {
    dateString: string;
    day: number;
    month: number;
    year: number;
    timestamp: number;
};

export default function ScheduleScreen({ navigation }: any) {
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [modalVisible, setModalVisible] = useState(false);
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [workplace, setWorkplace] = useState("");
    const [workSchedules, setWorkSchedules] = useState<
        Record<string, { start: string; end: string; workplace: string }>
    >({
        "2025-10-16": { start: "10:00", end: "18:00", workplace: "스마트커피" },
        "2025-10-17": { start: "09:00", end: "17:00", workplace: "스마트커피" },
    });

    // ✅ 날짜 클릭 시 해당 날짜 선택
    const handleDayPress = (day: DateObject) => {
        setSelectedDate(day.dateString);
    };

    // ✅ 일정 저장
    const handleSave = () => {
        if (!startTime || !endTime || !workplace) {
            return Alert.alert("입력 오류", "모든 항목을 입력해주세요.");
        }
        setWorkSchedules({
            ...workSchedules,
            [selectedDate]: { start: startTime, end: endTime, workplace },
        });
        setModalVisible(false);
    };

    // ✅ 일정 삭제
    const handleDelete = () => {
        const updated = { ...workSchedules };
        delete updated[selectedDate];
        setWorkSchedules(updated);
        setModalVisible(false);
    };

    // ✅ 일정 수정/추가 모달 열기
    const openEditModal = () => {
        const existing = workSchedules[selectedDate];
        if (existing) {
            setStartTime(existing.start);
            setEndTime(existing.end);
            setWorkplace(existing.workplace);
        } else {
            setStartTime("");
            setEndTime("");
            setWorkplace("");
        }
        setModalVisible(true);
    };

    return (
        <SafeAreaView style={s.container}>
            {/* 상단 헤더 */}
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={26} color="#111" />
                </TouchableOpacity>
                <Text style={s.title}>근무 일정</Text>
                <View style={{ width: 26 }} />
            </View>

            {/* 달력 */}
            <Calendar
                onDayPress={handleDayPress}
                markedDates={{
                    ...Object.keys(workSchedules).reduce((acc, date) => {
                        acc[date] = {
                            marked: true,
                            dotColor: "#007AFF",
                            selected: selectedDate === date,
                            selectedColor: "#007AFF",
                        };
                        return acc;
                    }, {} as Record<string, any>),
                }}
                theme={{
                    todayTextColor: "#007AFF",
                    arrowColor: "#007AFF",
                    textDayFontWeight: "500",
                    textMonthFontWeight: "bold",
                    textDayFontSize: 16,
                    monthTextColor: "#111",
                }}
                style={s.calendar}
            />

            {/* 선택된 날짜의 일정 표시 */}
            <ScrollView contentContainerStyle={s.infoContainer}>
                {selectedDate ? (
                    workSchedules[selectedDate] ? (
                        <TouchableOpacity
                            style={s.scheduleCard}
                            onPress={openEditModal}
                            activeOpacity={0.8}
                        >
                            <Text style={s.cardDate}>{selectedDate}</Text>
                            <Text style={s.cardText}>
                                근무시간: {workSchedules[selectedDate].start} ~ {workSchedules[selectedDate].end}
                            </Text>
                            <Text style={s.cardText}>
                                매장명: {workSchedules[selectedDate].workplace}
                            </Text>
                            <Text style={s.editHint}>수정</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={s.noWorkBox}>
                            <Text style={s.noWorkText}>
                                {selectedDate}은(는) 근무 일정이 없습니다.
                            </Text>
                            <TouchableOpacity style={s.addButton} onPress={openEditModal}>
                                <Ionicons name="add-circle-outline" size={22} color="#fff" />
                                <Text style={s.addButtonText}>일정 추가</Text>
                            </TouchableOpacity>
                        </View>
                    )
                ) : (
                    <Text style={s.noWorkText}>날짜를 선택하세요.</Text>
                )}
            </ScrollView>

            {/* 모달 */}
            <Modal visible={modalVisible} transparent animationType="fade">
                <View style={s.modalBackground}>
                    <View style={s.modalContainer}>
                        <Text style={s.modalTitle}>{selectedDate} 일정 관리</Text>

                        <TextInput
                            placeholder="근무 시작 시간 (예: 10:00)"
                            style={s.input}
                            value={startTime}
                            onChangeText={setStartTime}
                        />
                        <TextInput
                            placeholder="근무 종료 시간 (예: 18:00)"
                            style={s.input}
                            value={endTime}
                            onChangeText={setEndTime}
                        />
                        <TextInput
                            placeholder="매장명"
                            style={s.input}
                            value={workplace}
                            onChangeText={setWorkplace}
                        />

                        <View style={s.modalButtons}>
                            <TouchableOpacity style={s.saveButton} onPress={handleSave}>
                                <Text style={s.buttonText}>저장</Text>
                            </TouchableOpacity>

                            {workSchedules[selectedDate] && (
                                <TouchableOpacity style={s.deleteButton} onPress={handleDelete}>
                                    <Text style={s.buttonText}>삭제</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity style={s.cancelButton} onPress={() => setModalVisible(false)}>
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
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: "#fff",
        elevation: 2,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    title: { fontSize: 18, fontWeight: "bold", color: "#111" },
    calendar: {
        margin: 10,
        borderRadius: 12,
        elevation: 2,
        backgroundColor: "#fff",
    },
    infoContainer: {
        paddingBottom: 100,
        alignItems: "center",
    },
    scheduleCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        width: "90%",
        elevation: 3,
        marginTop: 10,
    },
    cardDate: { fontSize: 16, fontWeight: "bold", marginBottom: 6 },
    cardText: { fontSize: 15, color: "#333" },
    editHint: { color: "#007AFF", fontSize: 13, marginTop: 8, textAlign: "right" },
    noWorkBox: { alignItems: "center", marginTop: 20 },
    noWorkText: { fontSize: 15, color: "#555", textAlign: "center", marginBottom: 10 },
    addButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#007AFF",
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    addButtonText: { color: "#fff", marginLeft: 6, fontWeight: "bold" },

    // 모달 스타일
    modalBackground: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        width: "85%",
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 20,
        elevation: 5,
    },
    modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12, textAlign: "center" },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
    },
    modalButtons: { flexDirection: "row", justifyContent: "space-around", marginTop: 10 },
    saveButton: { backgroundColor: "#007AFF", padding: 10, borderRadius: 8 },
    deleteButton: { backgroundColor: "#FF3B30", padding: 10, borderRadius: 8 },
    cancelButton: { padding: 10, borderRadius: 8 },
    buttonText: { color: "#fff", fontWeight: "bold" },
    cancelText: { color: "#333" },
});
