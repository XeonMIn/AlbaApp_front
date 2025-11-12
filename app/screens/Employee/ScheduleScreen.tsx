import React, { useRef, useState, useMemo } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    Modal,
    Alert,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import WheelPickerExpo from "react-native-wheel-picker-expo";

type ScheduleItem = {
    id: number;
    title: string;
    start: string;
    end: string;
    status: string;
};

export default function ScheduleScreen() {
    const bottomSheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ["45%"], []);

    const [selectedDate, setSelectedDate] = useState<string>("");
    const [showModal, setShowModal] = useState(false);
    const [title, setTitle] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);

    const [startHour, setStartHour] = useState(9);
    const [startMinute, setStartMinute] = useState(0);
    const [endHour, setEndHour] = useState(13);
    const [endMinute, setEndMinute] = useState(0);

    const [schedules, setSchedules] = useState<Record<string, ScheduleItem[]>>({
        "2025-11-07": [
            {
                id: 1,
                title: "스마트커피 오전 근무",
                start: "09:00",
                end: "13:00",
                status: "진행중",
            },
        ],
    });

    const handleDayPress = (day: any) => {
        setSelectedDate(day.dateString);
        bottomSheetRef.current?.expand();
    };

    const handleAddPress = () => {
        if (!selectedDate) {
            Alert.alert("날짜 선택", "먼저 날짜를 선택해주세요.");
            return;
        }
        setEditingId(null);
        setTitle("");
        setStartHour(9);
        setStartMinute(0);
        setEndHour(13);
        setEndMinute(0);
        setShowModal(true);
    };

    const handleSave = () => {
        if (!title.trim()) {
            return Alert.alert("입력 오류", "일정 제목을 입력해주세요.");
        }

        const formatTime = (h: number, m: number) =>
            `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

        const newItem: ScheduleItem = {
            id: editingId || Date.now(),
            title,
            start: formatTime(startHour, startMinute),
            end: formatTime(endHour, endMinute),
            status: "예정",
        };

        setSchedules((prev) => {
            const existing = prev[selectedDate] || [];
            const updated = editingId
                ? existing.map((s) => (s.id === editingId ? newItem : s))
                : [...existing, newItem];
            return { ...prev, [selectedDate]: updated };
        });

        setShowModal(false);
        setEditingId(null);
        setTitle("");
    };

    const handleEdit = (item: ScheduleItem) => {
        const [sh, sm] = item.start.split(":");
        const [eh, em] = item.end.split(":");
        setEditingId(item.id);
        setTitle(item.title);
        setStartHour(Number(sh));
        setStartMinute(Number(sm));
        setEndHour(Number(eh));
        setEndMinute(Number(em));
        setShowModal(true);
    };

    const handleDelete = (id: number) => {
        Alert.alert("삭제 확인", "이 일정을 삭제하시겠습니까?", [
            { text: "취소", style: "cancel" },
            {
                text: "삭제",
                style: "destructive",
                onPress: () =>
                    setSchedules((prev) => ({
                        ...prev,
                        [selectedDate]: prev[selectedDate].filter((s) => s.id !== id),
                    })),
            },
        ]);
    };

    return (
        <SafeAreaView style={s.container}>
            {/* 상단 헤더 */}
            <View style={s.header}>
                <Text style={s.headerTitle}>근무 일정</Text>
                <TouchableOpacity>
                    <Ionicons name="person-circle" size={32} color="#111" />
                </TouchableOpacity>
            </View>

            {/* 달력 */}
            <Calendar
                onDayPress={handleDayPress}
                theme={{
                    backgroundColor: "#F8F9FB",
                    calendarBackground: "#F8F9FB",
                    dayTextColor: "#111",
                    monthTextColor: "#111",
                    arrowColor: "#007AFF",
                    todayTextColor: "#FF9500",
                    selectedDayBackgroundColor: "#007AFF",
                    selectedDayTextColor: "#fff",
                    textDisabledColor: "#ccc",
                    textDayFontSize: 15,
                    textMonthFontWeight: "bold",
                    textSectionTitleColor: "#555",
                }}
                style={s.calendar}
                markedDates={
                    selectedDate
                        ? { [selectedDate]: { selected: true, selectedColor: "#007AFF" } }
                        : {}
                }
            />

            {/* 일정 목록 시트 */}
            <BottomSheet
                ref={bottomSheetRef}
                index={-1}
                snapPoints={snapPoints}
                enablePanDownToClose
                backgroundStyle={s.sheetBackground}
            >
                <BottomSheetView style={s.sheetContent}>
                    <Text style={s.sheetTitle}>
                        {selectedDate ? `${selectedDate} 일정` : "날짜를 선택하세요"}
                    </Text>

                    {selectedDate && schedules[selectedDate]?.length ? (
                        schedules[selectedDate].map((item) => (
                            <View key={item.id} style={s.taskCard}>
                                <View style={s.dot} />
                                <View style={{ flex: 1 }}>
                                    <Text style={s.taskTitle}>{item.title}</Text>
                                    <Text style={s.taskTime}>
                                        {item.start} ~ {item.end}
                                    </Text>
                                </View>
                                <View style={s.taskActions}>
                                    <TouchableOpacity onPress={() => handleEdit(item)}>
                                        <Ionicons name="create-outline" size={20} color="#007AFF" />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => handleDelete(item.id)}
                                        style={{ marginLeft: 10 }}
                                    >
                                        <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    ) : (
                        <Text style={s.noSchedule}>등록된 일정이 없습니다.</Text>
                    )}
                </BottomSheetView>
            </BottomSheet>

            {/* Floating + 버튼 */}
            <TouchableOpacity style={s.fab} onPress={handleAddPress}>
                <Ionicons name="add" size={26} color="#fff" />
            </TouchableOpacity>

            {/* WheelPicker + 직접 입력 모달 */}
            <Modal visible={showModal} animationType="fade" transparent>
                <View style={s.modalBackground}>
                    <View style={s.modalContainer}>
                        <Text style={s.modalTitle}>
                            {editingId ? "일정 수정" : "새 일정 추가"}
                        </Text>

                        <TextInput
                            style={s.input}
                            placeholder="일정 제목"
                            value={title}
                            onChangeText={setTitle}
                        />

                        <View style={s.wheelRow}>
                            {/* 시작 시간 */}
                            <View style={{ flex: 1 }}>
                                <Text style={s.label}>시작 시간</Text>
                                <View style={s.wheelBox}>
                                    <WheelPickerExpo
                                        height={140}
                                        width={90}
                                        initialSelectedIndex={startHour}
                                        items={Array.from({ length: 24 }, (_, i) => ({
                                            label: `${i} 시`,
                                            value: i,
                                        }))}
                                        onChange={({ item }) => setStartHour(item.value)}
                                        renderItem={({ label }) => (
                                            <Text style={s.wheelText}>{label}</Text>
                                        )}
                                    />
                                    <WheelPickerExpo
                                        height={140}
                                        width={90}
                                        initialSelectedIndex={startMinute}
                                        items={Array.from({ length: 60 }, (_, i) => ({
                                            label: `${i} 분`,
                                            value: i,
                                        }))}
                                        onChange={({ item }) => setStartMinute(item.value)}
                                        renderItem={({ label }) => (
                                            <Text style={s.wheelText}>{label}</Text>
                                        )}
                                    />
                                </View>

                                {/* 직접 입력 */}
                                <View style={s.inputRow}>
                                    <TextInput
                                        style={s.timeInput}
                                        keyboardType="numeric"
                                        maxLength={2}
                                        value={String(startHour)}
                                        onChangeText={(v) => {
                                            const n = parseInt(v) || 0;
                                            setStartHour(Math.min(Math.max(n, 0), 23));
                                        }}
                                        placeholder="시"
                                    />
                                    <Text style={s.colon}>:</Text>
                                    <TextInput
                                        style={s.timeInput}
                                        keyboardType="numeric"
                                        maxLength={2}
                                        value={String(startMinute)}
                                        onChangeText={(v) => {
                                            const n = parseInt(v) || 0;
                                            setStartMinute(Math.min(Math.max(n, 0), 59));
                                        }}
                                        placeholder="분"
                                    />
                                </View>
                            </View>

                            {/* 종료 시간 */}
                            <View style={{ flex: 1 }}>
                                <Text style={s.label}>종료 시간</Text>
                                <View style={s.wheelBox}>
                                    <WheelPickerExpo
                                        height={140}
                                        width={90}
                                        initialSelectedIndex={endHour}
                                        items={Array.from({ length: 24 }, (_, i) => ({
                                            label: `${i} 시`,
                                            value: i,
                                        }))}
                                        onChange={({ item }) => setEndHour(item.value)}
                                        renderItem={({ label }) => (
                                            <Text style={s.wheelText}>{label}</Text>
                                        )}
                                    />
                                    <WheelPickerExpo
                                        height={140}
                                        width={90}
                                        initialSelectedIndex={endMinute}
                                        items={Array.from({ length: 60 }, (_, i) => ({
                                            label: `${i} 분`,
                                            value: i,
                                        }))}
                                        onChange={({ item }) => setEndMinute(item.value)}
                                        renderItem={({ label }) => (
                                            <Text style={s.wheelText}>{label}</Text>
                                        )}
                                    />
                                </View>

                                {/* 직접 입력 */}
                                <View style={s.inputRow}>
                                    <TextInput
                                        style={s.timeInput}
                                        keyboardType="numeric"
                                        maxLength={2}
                                        value={String(endHour)}
                                        onChangeText={(v) => {
                                            const n = parseInt(v) || 0;
                                            setEndHour(Math.min(Math.max(n, 0), 23));
                                        }}
                                        placeholder="시"
                                    />
                                    <Text style={s.colon}>:</Text>
                                    <TextInput
                                        style={s.timeInput}
                                        keyboardType="numeric"
                                        maxLength={2}
                                        value={String(endMinute)}
                                        onChangeText={(v) => {
                                            const n = parseInt(v) || 0;
                                            setEndMinute(Math.min(Math.max(n, 0), 59));
                                        }}
                                        placeholder="분"
                                    />
                                </View>
                            </View>
                        </View>

                        <TouchableOpacity style={s.addButton} onPress={handleSave}>
                            <Text style={s.addButtonText}>저장</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={s.cancelButton}
                            onPress={() => setShowModal(false)}
                        >
                            <Text style={s.cancelText}>취소</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8F9FB" },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 14,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    headerTitle: { color: "#111", fontSize: 20, fontWeight: "bold" },
    calendar: { borderRadius: 16, marginBottom: 10 },
    sheetBackground: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
    },
    sheetContent: { flex: 1, padding: 20 },
    sheetTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
    taskCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F8F9FB",
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#007AFF",
        marginRight: 10,
    },
    taskTitle: { fontWeight: "bold", color: "#111" },
    taskTime: { color: "#777", fontSize: 13 },
    taskActions: { flexDirection: "row", alignItems: "center" },
    noSchedule: {
        textAlign: "center",
        color: "#999",
        marginVertical: 20,
        fontSize: 15,
    },
    fab: {
        position: "absolute",
        bottom: 30,
        right: 25,
        backgroundColor: "#007AFF",
        width: 52,
        height: 52,
        borderRadius: 26,
        justifyContent: "center",
        alignItems: "center",
        elevation: 5,
    },
    modalBackground: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.4)",
    },
    modalContainer: {
        width: "90%",
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 20,
    },
    modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
    },
    label: { color: "#555", fontSize: 14, marginBottom: 5 },
    wheelRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: 10,
    },
    wheelBox: {
        flexDirection: "row",
        justifyContent: "space-around",
        backgroundColor: "#F8F9FB",
        borderRadius: 10,
        paddingVertical: 10,
        marginTop: 4,
    },
    wheelText: {
        fontSize: 20,
        fontWeight: "600",
        color: "#111",
        textAlign: "center",
    },
    inputRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 6,
    },
    timeInput: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        paddingVertical: 4,
        paddingHorizontal: 8,
        width: 50,
        textAlign: "center",
        fontSize: 16,
        color: "#111",
        backgroundColor: "#fff",
    },
    colon: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#111",
        marginHorizontal: 4,
    },
    addButton: {
        backgroundColor: "#007AFF",
        borderRadius: 8,
        alignItems: "center",
        paddingVertical: 12,
        marginTop: 10,
    },
    addButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
    cancelButton: { marginTop: 10, alignItems: "center" },
    cancelText: { color: "#555", fontSize: 15 },
});
