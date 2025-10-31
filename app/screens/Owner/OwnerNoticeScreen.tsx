// app/screens/Owner/OwnerNoticeScreen.tsx
import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Modal,
    TextInput,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

type Notice = {
    id: string;
    title: string;
    content: string;
    date: string;
    important: boolean;
};

export default function OwnerNoticeScreen({ navigation }: any) {
    const [notices, setNotices] = useState<Notice[]>([
        {
            id: "1",
            title: "이번 주 주말 휴무 안내",
            content: "10월 27~28일은 매장 정기 점검으로 휴무입니다.",
            date: "2025-10-20",
            important: true,
        },
        {
            id: "2",
            title: "11월 근무복 변경",
            content: "11월부터 새로운 유니폼을 착용합니다. 사이즈는 10월 말까지 제출해주세요.",
            date: "2025-10-18",
            important: false,
        },
    ]);
    const [modalVisible, setModalVisible] = useState(false);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [important, setImportant] = useState(false);

    // 공지 추가
    const handleAddNotice = () => {
        if (!title || !content) {
            return Alert.alert("입력 오류", "제목과 내용을 모두 입력해주세요.");
        }
        const newNotice: Notice = {
            id: Date.now().toString(),
            title,
            content,
            date: new Date().toISOString().split("T")[0],
            important,
        };
        setNotices([newNotice, ...notices]);
        setModalVisible(false);
        setTitle("");
        setContent("");
        setImportant(false);
    };

    // 공지 삭제
    const handleDelete = (id: string) => {
        Alert.alert("공지 삭제", "정말 삭제하시겠습니까?", [
            { text: "취소", style: "cancel" },
            {
                text: "삭제",
                style: "destructive",
                onPress: () => {
                    setNotices(notices.filter((n) => n.id !== id));
                },
            },
        ]);
    };

    return (
        <SafeAreaView style={s.container}>
            {/* ✅ 상단 헤더 */}
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={26} color="#111" />
                </TouchableOpacity>
                <Text style={s.title}>📢 공지사항 관리</Text>
                <TouchableOpacity onPress={() => setModalVisible(true)}>
                    <Ionicons name="add-circle-outline" size={28} color="#007AFF" />
                </TouchableOpacity>
            </View>

            {/* 공지 리스트 */}
            <ScrollView contentContainerStyle={{ padding: 16 }}>
                {notices.map((n) => (
                    <View key={n.id} style={s.noticeCard}>
                        <View style={{ flex: 1 }}>
                            <View style={s.cardHeader}>
                                {n.important && (
                                    <Ionicons
                                        name="alert-circle"
                                        size={18}
                                        color="red"
                                        style={{ marginRight: 6 }}
                                    />
                                )}
                                <Text style={s.noticeTitle}>{n.title}</Text>
                            </View>
                            <Text style={s.noticeContent}>{n.content}</Text>
                            <Text style={s.noticeDate}>{n.date}</Text>
                        </View>
                        <TouchableOpacity onPress={() => handleDelete(n.id)}>
                            <Ionicons name="trash-outline" size={22} color="#FF3B30" />
                        </TouchableOpacity>
                    </View>
                ))}
                {notices.length === 0 && (
                    <Text style={s.noNotice}>등록된 공지사항이 없습니다.</Text>
                )}
            </ScrollView>

            {/* 공지 추가 모달 */}
            <Modal transparent visible={modalVisible} animationType="fade">
                <View style={s.modalBackground}>
                    <View style={s.modalContainer}>
                        <Text style={s.modalTitle}>새 공지 작성</Text>

                        <TextInput
                            style={s.input}
                            placeholder="공지 제목"
                            value={title}
                            onChangeText={setTitle}
                        />
                        <TextInput
                            style={[s.input, { height: 100 }]}
                            placeholder="공지 내용"
                            value={content}
                            onChangeText={setContent}
                            multiline
                        />

                        <TouchableOpacity
                            style={s.checkRow}
                            onPress={() => setImportant(!important)}
                        >
                            <Ionicons
                                name={important ? "checkbox" : "square-outline"}
                                size={22}
                                color={important ? "#007AFF" : "#666"}
                            />
                            <Text style={s.checkLabel}>중요 공지로 표시</Text>
                        </TouchableOpacity>

                        <View style={s.modalButtons}>
                            <TouchableOpacity style={s.saveButton} onPress={handleAddNotice}>
                                <Text style={s.saveText}>등록</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={s.cancelButton}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={s.cancelText}>취소</Text>
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
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    title: { fontSize: 20, fontWeight: "bold", color: "#111" },

    noticeCard: {
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
    },
    noticeTitle: { fontSize: 16, fontWeight: "bold", color: "#111" },
    noticeContent: { fontSize: 14, color: "#555", marginBottom: 8 },
    noticeDate: { fontSize: 12, color: "#888" },
    noNotice: { textAlign: "center", color: "#777", marginTop: 20 },

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
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
    },
    checkRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    checkLabel: { marginLeft: 8, fontSize: 15, color: "#333" },
    modalButtons: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 10,
    },
    saveButton: { backgroundColor: "#007AFF", padding: 10, borderRadius: 8, minWidth: 80 },
    cancelButton: { padding: 10, borderRadius: 8, minWidth: 80 },
    saveText: { color: "#fff", fontWeight: "bold", textAlign: "center" },
    cancelText: { color: "#333", textAlign: "center" },
});
